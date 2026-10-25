import { Seo } from "@/components/ui";
import { ContactSection } from "@/features/contact/ContactSection";

export default function ContactPage() {
  return (
    <>
      <Seo title="Contact" description="Contact John Aldwin R. Samson by email, LinkedIn or GitHub." />
      <div className="pt-8 sm:pt-16 lg:pt-20">
        <ContactSection headingLevel="h1" />
      </div>
    </>
  );
}
