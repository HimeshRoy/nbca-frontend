export default function PrivacyPolicyPage() {
  return (
    <main className="py-20 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: July 20, 2026</p>
        
        <div className="prose prose-slate max-w-none">
          <h3>1. Information We Collect</h3>
          <p>NBCA collects personal information you provide during registration, such as your name, email, phone number, and academic details, to provide our coaching services effectively.</p>

          <h3>2. How We Use Your Information</h3>
          <p>We use your data to manage your enrollment, track academic progress, communicate class schedules, and provide technical support.</p>

          <h3>3. Data Protection</h3>
          <p>We are committed to ensuring your information is secure. We implement suitable physical, electronic, and managerial procedures to safeguard the data we collect.</p>

          <h3>4. Third-Party Sharing</h3>
          <p>We do not sell, distribute, or lease your personal information to third parties unless required by law.</p>

          <h3>5. Contact Us</h3>
          <p>If you have questions about how we handle your data, please contact us at support@nbca.co.in.</p>
        </div>
      </div>
    </main>
  );
}