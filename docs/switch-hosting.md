# Switching hosting: Vercel and AWS

The site can be served from **Vercel** (free) or from **AWS** (S3 + CloudFront). The AWS setup is kept in this repository as a
dormant option. Which one the domain points to is **one Terraform setting** (`hosting.target` in
`infra/terraform/environments/prod/prod.tfvars`), so there is no manual DNS editing and no Terraform drift.

| | Vercel (normal) | AWS (dormant) |
|---|---|---|
| Serves aldwinsamson.com | yes | S3 + CloudFront stay deployed but unreachable by the domain |
| Deploys | automatically on every push to `main` | by hand: Actions → **Deploy to AWS (manual)** |
| Chatbot | `api/chat.mjs` (Vercel function) | optional: `chat = { enabled = true }` (Lambda + API Gateway) |
| Checks on every push | type check, tests, npm audit, Checkov, `check:knowledge`, chat self-test (`ci.yml`) | same |

All commands are **PowerShell**. Run Terraform from `infra\terraform\environments\prod` after:

```powershell
aws sso login --profile portfolio
$env:AWS_PROFILE = "portfolio"
```

and always quote the var files: `"-var-file=../../environment.tfvars" "-var-file=prod.tfvars"`.

---

## A. One-time preparation (do this before the first switch)

**A1. Tag the last all-AWS version** (a one-command way back):

```powershell
git tag aws-hosting-final
git push origin aws-hosting-final
```

**A2. Move the bootstrap state off your laptop.** Bootstrap (state bucket, DNS zone, OIDC roles, budget) keeps its state in a
*local* file. If you lose it, you can no longer manage those resources with Terraform.

```powershell
cd infra\terraform\bootstrap
Copy-Item terraform.tfstate "$HOME\Documents\bootstrap-tfstate-backup.json"
```

Add this inside the `terraform { ... }` block of `infra/terraform/bootstrap/versions.tf`:

```hcl
  backend "s3" {
    key          = "bootstrap/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
```

```powershell
terraform init -migrate-state "-backend-config=bucket=<state bucket>"
```

Answer `yes` to "copy existing state to the new backend". Expected: `Successfully configured the backend "s3"`.
(Get the bucket name with `terraform output state_bucket`.) Keep the backup file.

**A3. Lower the monthly budget** to what the dormant setup costs, so a surprise stands out. In
`infra/terraform/bootstrap/bootstrap.tfvars` set `monthly_budget_usd = 5`, then in `infra\terraform\bootstrap`:

```powershell
terraform apply "-var-file=../environment.tfvars" "-var-file=bootstrap.tfvars"
```

Expected: `1 to change` (the budget).

---

## B. Switch to Vercel (first time)

**B1. Create the Vercel project.** vercel.com → *Add New → Project* → import `aldwinsamson/Aldwin_Samson_Portfolio`.
Framework preset *Vite* (the repo's `vercel.json` sets build command `npm run build` and output `dist`).

**B2. Environment variables** (Project → Settings → Environment Variables):

| Name | Value | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio key | mark **Sensitive**; never name it `VITE_...` (that would publish it) |

`VITE_CHAT_API_URL=/api/chat` is already set by `vercel.json` (`build.env`). Do **not** rely on `.env.production`: it is git-ignored, so Vercel and
GitHub never see it.

**B3. Test on the `*.vercel.app` address before touching DNS.**

```powershell
curl.exe -sI https://<your-project>.vercel.app/ | Select-String "HTTP|server|content-security|strict-transport"
curl.exe -s -X POST https://<your-project>.vercel.app/api/chat -H "content-type: application/json" -d '{\"messages\":[{\"role\":\"user\",\"content\":\"What is LIGTAS?\"}]}'
```

Expected: `HTTP/1.1 200`, `Server: Vercel`, a `Content-Security-Policy` header, and a JSON answer from the second command.
Then open the site, press **F12 → Console**, click every page in light and dark theme. There must be no `Refused to ...` lines.
(Turn the Vercel Toolbar off in project settings; on previews it can add harmless CSP warnings.)

**B4. Add the domain in Vercel** (Project → Settings → Domains): add `aldwinsamson.com` and `www.aldwinsamson.com`; set `www` to
**redirect to** `aldwinsamson.com`. Vercel shows the A-record value(s) it wants. The values can change over time, so always copy them from the Vercel dashboard rather than from this document.

**B5. Point the domain at Vercel (Terraform).** In `prod.tfvars`:

```hcl
hosting = {
  target = "vercel"
  vercel = {
    ipv4 = ["<vercel-ipv4>"]   # paste exactly what Vercel shows
    ttl  = 60
  }
}
```

```powershell
terraform plan "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
```

Expected (read it carefully): **2 to change** — the two `A` records (`aldwinsamson.com`, `www.aldwinsamson.com`) updated *in place* from alias to
plain records — and **2 to destroy**, the two `AAAA` records. **Nothing else.** If a record shows `must be replaced`, or anything from `static_site`'s
S3/CloudFront appears, stop and investigate before applying.

```powershell
terraform apply "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
git add -A; git commit -m "Point the domain at Vercel"; git push
```

**B6. Verify.**

```powershell
nslookup aldwinsamson.com 8.8.8.8
curl.exe -sI https://aldwinsamson.com | Select-String "HTTP|server|via|x-vercel"
curl.exe -sI https://www.aldwinsamson.com | Select-String "HTTP|location"
```

Expected: the Vercel IP, `Server: Vercel`, and **no** `Via: ... CloudFront`; `www` answers `308`/`301` with `location: https://aldwinsamson.com/`.
The first HTTPS request can take a minute while Vercel issues the certificate; Vercel's Domains page should say *Valid Configuration*.
Do this at a quiet hour.

**B7. Wait 3 to 7 days** before reducing costs in part C. The AWS copy is your fallback; to roll back immediately, go to part D.

---

## C. Stop the AWS charges (cheapest reversible way)

**C1. Lab off** (a 2 GiB EC2 + disk ≈ US$13–17/month). It is disposable: Argo CD rebuilds everything from `gitops/` in about 10 minutes.
In `prod.tfvars` set `enabled = false` inside `lab = { ... }`, then:

```powershell
terraform plan "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
terraform apply "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
```

Expected: about `17 to destroy`, every line starting with `module.k3s_lab`. Then delete the two parameters the server created itself:

```powershell
aws ssm delete-parameters --region ap-southeast-1 --names /aldwinsamson/prod/lab/argocd-admin-password /aldwinsamson/prod/lab/grafana-admin-password
```

*Stopping instead of destroying:* a stopped instance is **not** drift for Terraform, but (1) the nightly **start schedule** restarts it every
morning, so also set `schedule = { enabled = false }`, and (2) its 30 GiB disk still bills ≈ US$3/month. Destroying costs nothing to undo.

**C2. Chat on AWS off.** If you ever enabled it, set `chat = { enabled = false }` in `prod.tfvars` and apply (expected: the Lambda, API, role, log group
destroyed). Then delete the key: `aws ssm delete-parameter --region ap-southeast-1 --name /aldwinsamson/prod/chat/anthropic-api-key`. Revoke that key
in the Anthropic Console if it is no longer used.

**C3. Prove they are gone** (each command should print `[]`):

```powershell
$r = "ap-southeast-1"
aws ec2 describe-instances --region $r --filters "Name=tag:Project,Values=aldwinsamson" "Name=instance-state-name,Values=pending,running,stopping,stopped" --query "Reservations[].Instances[].InstanceId"
aws ec2 describe-volumes --region $r --query "Volumes[].VolumeId"
aws ec2 describe-addresses --region $r --query "Addresses[].PublicIp"
aws ec2 describe-nat-gateways --region $r --filter "Name=state,Values=available,pending" --query "NatGateways[].NatGatewayId"
aws scheduler list-schedules --region $r --query "Schedules[].Name"
aws lambda list-functions --region $r --query "Functions[].FunctionName"
aws apigatewayv2 get-apis --region $r --query "Items[].Name"
aws ssm describe-parameters --region $r --query "Parameters[].Name"
```

**C4. What still bills while the AWS site is dormant** (rough list prices, check Cost Explorer after a month):

| Resource | Approx. per month |
|---|---|
| Route 53 hosted zone | $0.50 |
| Route 53 health check (it now monitors the Vercel site) | ≈ $1.75 — set `monitoring = { health_check_enabled = false }` and use a free uptime monitor to drop it |
| S3 site bucket + Terraform state bucket | cents |
| CloudFront (no traffic), ACM, SNS, 2 alarms, 1 dashboard, SSM standard parameters, Budgets | $0 (free tiers) |
| NAT gateways, Elastic IPs, EBS snapshots, lock table | none exist in this setup (state locking uses S3, not DynamoDB) |

So "dormant" is about **$2–3/month**, not $0. To reach $0 you must delete the zone and the AWS site (see E).

---

## D. Switch back to AWS (about an hour)

Refresh the AWS copy **first**, flip DNS **last**.

1. *(only if you want the AI assistant on AWS)* create the key, then enable the module:
   ```powershell
   aws ssm put-parameter --region ap-southeast-1 --name /aldwinsamson/prod/chat/anthropic-api-key --type SecureString --value "sk-ant-..."
   ```
   In `prod.tfvars` set `chat = { enabled = true }`, apply, then run `terraform output chat_api_url chat_api_origin`.
   Add the origin to `site.csp.connect_hosts` (e.g. `["https://abc123.execute-api.ap-southeast-1.amazonaws.com"]`) and apply again.
   Set the repo variable: `gh variable set CHAT_API_URL --body "<chat_api_url>"`.
2. *(optional)* lab back on: `enabled = true` in `lab = { ... }`, apply, then follow `infra/README.md` part 8.
3. **Publish the current site to AWS:**
   ```powershell
   gh workflow run "Deploy to AWS (manual)"
   gh run watch
   ```
   Expected: green; the last step smoke-tests the CloudFront address, not the domain.
4. **Check the AWS copy directly** (the domain still points to Vercel):
   ```powershell
   $cf = terraform output -raw cloudfront_domain
   curl.exe -sI "https://$cf/" | Select-String "HTTP|via|content-security"
   ```
5. **Flip DNS:** in `prod.tfvars` set `hosting = { target = "aws" }` (or delete the block), then plan and apply. Expected: **2 to change** (the `A` records back to aliases) and
   **2 to add** (the `AAAA` aliases).
6. **Verify:** `curl.exe -sI https://aldwinsamson.com | Select-String "via|x-cache"` shows `CloudFront` and no `Server: Vercel`.
7. **Last, remove the domain from the Vercel project** (Settings → Domains → Remove) so a stale Vercel project can never serve it again.

---

## E. Keep or delete the DNS zone and the state bucket?

| Choice | Result |
|---|---|
| **Keep the zone** (recommended) | $0.50/month. Same nameservers forever, switching is a Terraform setting with a 60-second TTL, certificates keep renewing. |
| Delete the zone | Saves only $0.50/month. A recreated zone gets **new nameservers**: you must change them at the registrar and wait up to 48 h; Terraform's `prevent_destroy` on the zone and the registrar's old delegation make it a risky operation. Change the registrar first, wait, then delete. |
| **Keep the state bucket** (required) | Cents. `terraform init` needs it. |
| Delete the state bucket | You lose the state for everything in it: Terraform can no longer manage or destroy the AWS resources (you would delete them by hand). Never do this while AWS resources exist. |

---

## F. Safety checklist for any cut-over

- Vercel works on its `*.vercel.app` address **before** DNS changes (B3).
- DNS is changed only through Terraform; never edit Route 53 records by hand (that creates drift and breaks a later destroy).
- The AAAA records are removed when pointing to Vercel (B5), so IPv6 visitors are not sent to CloudFront.
- Keep the AWS site deployed for 3 to 7 days after the switch.
- The ACM validation CNAMEs stay in Route 53 so the (dormant) certificate keeps renewing.
- When you stop using a hosting provider for the domain, remove the domain there (Vercel → Domains → Remove) *and* remove the DNS records that point to it.
  A leftover record pointing to a deleted project is how domains get taken over.
- HSTS is set for two years with `includeSubDomains`: every subdomain you ever create must work over HTTPS.
- The in-code rate limiter is per server instance only. Set a spending cap in the model provider's console if billing is enabled.

## G. Troubleshooting

| Symptom | Fix |
|---|---|
| Plan wants to *replace* an `A` record | Do not apply. Find out why the record is being replaced first |
| Vercel says *Invalid Configuration* for `www` | Keep `www` as a redirect in Vercel and check that the `www` A record has the same IP as the apex |
| Chat says it is offline on Vercel | `GEMINI_API_KEY` missing for that environment, or the key's free quota is used up; the site falls back to its offline search |
| Chat is blocked on a preview | It should work: same-origin requests are allowed. Check the function log in Vercel |
| Manual AWS deploy: `AccessDenied` on `GetDistribution` | Apply the prod stack once (it adds `cloudfront:GetDistribution` to the deploy role) |
| `terraform init` asks for a bucket | `terraform init "-backend-config=bucket=<state bucket>"` |
