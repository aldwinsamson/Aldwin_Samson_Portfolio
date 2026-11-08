# AWS at $0, and how to come back

Vercel serves the site. This page shows how to reach a **$0.00 AWS bill** and how to return to AWS later. The Terraform code stays in the repo,
so coming back is two switches and one deploy, not a rebuild.

Two switches control everything:

| Switch | File | `true` | `false` |
|---|---|---|---|
| `aws_site_enabled` | `infra/terraform/environments/prod/prod.tfvars` | S3, CloudFront, certificate, monitoring and deploy role exist | all of them destroyed |
| `dns_zone_enabled` | `infra/terraform/bootstrap/bootstrap.tfvars` | Route 53 hosted zone exists (about $0.50/month) | zone deleted (DNS lives at Vercel) |

What stays after both are `false` and costs nothing: the Terraform state bucket (a few KB), the GitHub login provider and roles, and the budget alert.
Not covered: if you **registered the domain through AWS Route 53**, the yearly renewal is a separate charge (check AWS Console > Route 53 > Registered domains).
Domain registration at another registrar is not an AWS cost.

All commands are PowerShell. Terraform commands start with:

```powershell
aws sso login --profile portfolio
$env:AWS_PROFILE = "portfolio"
```

and always quote the var files.

---

## Z. Go to $0

### Z1. Move DNS to Vercel first (this is the only step that can cause downtime)

1. List every record in the current zone and keep the output. Look for anything besides the website: `MX`, `TXT` (email, verification), `CNAME`.
   ```powershell
   $zone = (aws route53 list-hosted-zones-by-name --dns-name aldwinsamson.com --query "HostedZones[0].Id" --output text)
   aws route53 list-resource-record-sets --hosted-zone-id $zone --query "ResourceRecordSets[?Type!='NS' && Type!='SOA']" --output table
   ```
2. In Vercel: **Settings > Domains > aldwinsamson.com > Edit** (or Team **Domains**) and choose **Use Vercel DNS / Nameservers**. Vercel shows two name servers
   (normally `ns1.vercel-dns.com` and `ns2.vercel-dns.com`). In Vercel's DNS records page, re-create any `MX`/`TXT` records from step 1 that are not for the website.
3. At your registrar, replace the name servers with Vercel's two. Do not touch anything else.
4. Wait until the world sees it (usually under an hour, up to 48 h):
   ```powershell
   nslookup -type=NS aldwinsamson.com 8.8.8.8
   ```
   **Expect:** `vercel-dns.com` names, no `awsdns`. Then check https://aldwinsamson.com and https://www.aldwinsamson.com load, and that Vercel shows **Valid Configuration**.
   Wait a full day before Z3 if you can, so slow resolvers drop the old name servers.

### Z2. Destroy the AWS website

In `prod.tfvars` set `aws_site_enabled = false` (leave the rest), then:

```powershell
cd infra\terraform\environments\prod
terraform init
terraform plan "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
```

**Expect:** `Plan: 0 to add, 0 to change, N to destroy` and every resource starts with `module.static_site[0]`, `module.monitoring[0]` or `module.site_deploy_role[0]`,
plus lines saying a module "has moved". Nothing from `k3s_lab`. If anything else is listed, stop and send me the plan.

```powershell
terraform apply "-var-file=../../environment.tfvars" "-var-file=prod.tfvars"
```

Deleting CloudFront takes 10-20 minutes; that is normal. **Expect:** `Apply complete!`.

### Z3. Delete the DNS zone

In `bootstrap.tfvars` set `dns_zone_enabled = false`, then:

```powershell
cd ..\..\bootstrap
terraform plan "-var-file=../environment.tfvars" "-var-file=bootstrap.tfvars"
```

**Expect:** `Plan: 0 to add, 0 to change, 1 to destroy` (`aws_route53_zone.primary[0]`). Then apply.
If it says `HostedZoneNotEmpty`, a record you created by hand is still in the zone: delete it in the Route 53 console (after copying it to Vercel DNS) and apply again.

### Z4. Prove it is gone and commit

```powershell
$r = "ap-southeast-1"
aws route53 list-hosted-zones --query "HostedZones[].Name"
aws route53 list-health-checks --query "HealthChecks[].Id"
aws cloudfront list-distributions --query "DistributionList.Items[].Id"
aws ec2 describe-instances --region $r --query "Reservations[].Instances[].InstanceId"
aws ec2 describe-volumes --region $r --query "Volumes[].VolumeId"
aws ec2 describe-addresses --region $r --query "Addresses[].PublicIp"
aws s3 ls
```

**Expect:** empty results, except `aws s3 ls` which should list only the `...-tfstate-...` bucket. Then:

```powershell
cd ..\..\..
git add -A
git commit -m "AWS website and DNS zone off: Vercel only"
git push
```

Approve the Terraform run on GitHub. **Expect:** `No changes`.
The `Deploy to AWS (manual)` workflow will fail until you come back. That is expected.
After a full billing cycle, Cost Explorer should show about $0.00 per day.

---

## R. Come back to AWS

1. **Zone first.** In `bootstrap.tfvars` set `dns_zone_enabled = true`, apply, then read the new name servers:
   ```powershell
   cd infra\terraform\bootstrap
   terraform apply "-var-file=../environment.tfvars" "-var-file=bootstrap.tfvars"
   terraform output name_servers
   ```
   These are **new** name servers. Re-create in Route 53 any `MX`/`TXT` records you moved to Vercel DNS.
2. **Delegate.** At your registrar, replace Vercel's name servers with the four above. Wait for `nslookup -type=NS aldwinsamson.com 8.8.8.8` to show `awsdns`.
   The site is down between this step and step 3 unless you do step 3 with `target = "vercel"` as written.
3. **Build the AWS copy while Vercel's address stays in DNS.** In `prod.tfvars` set `aws_site_enabled = true` and keep `hosting.target = "vercel"`
   (use Vercel's current A record in `hosting.vercel.ipv4`). Apply. Then set the GitHub variables printed by `terraform output github_variables_commands`
   and publish: `gh workflow run "Deploy to AWS (manual)"`.
   The certificate is checked through DNS, so this apply waits until the name servers from step 2 are live.
4. **Check the AWS copy** directly: `curl.exe -sI "https://$(terraform output -raw cloudfront_domain)/"`.
5. **Flip DNS:** set `hosting = { target = "aws" }`, plan (**expect** `2 to change, 2 to add`), apply. Verify `Via: ... CloudFront` on https://aldwinsamson.com.
6. Last, remove the domain from the Vercel project so a leftover project never serves your name.

The AI assistant on AWS (`chat = { enabled = true }`) is **not** compatible with the Gemini setup: that Lambda module still expects an Anthropic key.
After a return to AWS the site works with its built-in offline search until that module is updated.
