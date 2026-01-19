import React from 'react';
import { Mail, Phone, MapPin, AlertTriangle, ShieldCheck, UserCheck, Search, Handshake } from 'lucide-react';
import MetaSEO from '../components/MetaSEO';

const PageWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500">
    <MetaSEO title={`${title} - Samta Matrimony`} />
    <h1 className="text-5xl font-serif font-black text-[#800000] mb-4">{title}</h1>
    <div className="w-20 h-1.5 bg-[#FFD700] rounded-full mb-12"></div>
    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:text-[#800000] prose-p:text-slate-600 prose-li:text-slate-600">
      {children}
    </div>
  </div>
);

export const AboutUs = () => (
  <PageWrapper title="Our Story">
    <p>Welcome to Samta Matrimony, where tradition meets technology. Launched in January 2026, our mission is to simplify the journey of finding a life partner while respecting the deep-rooted cultural values of our community.</p>
    <h3>Why "Samta"?</h3>
    <p>The word 'Samta' stands for equilibrium, equality, and harmony. We believe a successful marriage is built on these very principles. Our platform is designed to help you find someone who resonates with your worldview and lifestyle.</p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 not-prose">
       {[
         { label: 'Trust', desc: '100% manually verified profiles.' },
         { label: 'Privacy', desc: 'You control your data visibility.' },
         { label: 'Free Access', desc: 'No hidden charges or subscriptions.' }
       ].map(i => (
         <div key={i.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <p className="text-[#800000] font-black text-xl mb-1">{i.label}</p>
            <p className="text-slate-500 text-sm">{i.desc}</p>
         </div>
       ))}
    </div>
  </PageWrapper>
);

export const PrivacyPolicy = () => (
  <PageWrapper title="Privacy Policy">
    <p className="font-bold">Effective Date: January 1, 2026</p>
    
    <h3>1. Introduction & Purpose</h3>
    <p>Samta Matrimony is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our free matchmaking platform. By registering, you agree to the practices described herein.</p>

    <h3>2. Information We Collect</h3>
    <p>To provide effective matchmaking services, we collect the following information:</p>
    <ul>
      <li><strong>Personal Details:</strong> Name, age, gender, date of birth, religion, caste, mother tongue, and marital status.</li>
      <li><strong>Contact Information:</strong> Valid email address and mobile number (verified via OTP).</li>
      <li><strong>Profile Data:</strong> Photos, education, occupation, income details, and family background.</li>
      <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies to enhance user experience.</li>
    </ul>

    <h3>3. How We Use Your Information</h3>
    <p>Your data is used solely for the purpose of helping you find a life partner:</p>
    <ul>
      <li>Facilitating matchmaking and profile recommendations.</li>
      <li>Verifying user identity to maintain a safe environment.</li>
      <li>Communicating with you regarding interests, messages, and account updates.</li>
      <li>Improving our website functionality and security measures.</li>
    </ul>

    <h3>4. Cookies & Advertising</h3>
    <p>We use cookies to personalize content and ads. We also share information about your use of our site with our advertising partners who may combine it with other information that you've provided to them or that they've collected from your use of their services.</p>
    <p><strong>Google AdSense:</strong> Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.</p>

    <h3>5. Data Protection & Security</h3>
    <p>We implement robust industry-standard encryption and physical security measures to protect your data from unauthorized access or disclosure. As a free platform, we do not collect or store any financial information (credit card/bank details).</p>

    <h3>6. Fake Profile & Misuse Monitoring</h3>
    <p>We actively monitor the platform for fake or suspicious activity. We reserve the right to verify any profile manually. Suspicious accounts will be terminated immediately to protect our genuine users.</p>

    <h3>7. User Rights & Data Retention</h3>
    <p>You have the right to edit your profile details at any time through your dashboard. You may request permanent deletion of your account and associated data by contacting our support team. We retain your information only as long as your account is active.</p>

    <h3>8. Legal Compliance</h3>
    <p>This policy is compliant with the Information Technology Act, 2000 and the SPDI Rules, 2011 of India.</p>

    <h3>9. Contact Us</h3>
    <p>For any privacy-related queries, please email us at <span className="font-bold text-[#800000]">support@samta-matrimony.com</span>.</p>
  </PageWrapper>
);

export const TermsConditions = () => (
  <PageWrapper title="Terms & Conditions">
    <p className="font-bold">Effective Date: January 1, 2026</p>

    <div className="bg-slate-50 border-l-4 border-[#FFD700] p-8 rounded-r-2xl my-10 not-prose">
       <div className="flex flex-col md:flex-row gap-6">
          <AlertTriangle size={32} className="text-[#800000] shrink-0" />
          <div>
            <h4 className="font-black text-[#800000] uppercase text-sm tracking-widest mb-3">Professional Legal Disclaimer</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4">
               Samta Matrimony provides a platform for members to explore and connect with prospective life partners. This service is provided strictly as a facilitator. By using this platform, you acknowledge and agree to the following terms of engagement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex gap-3">
                  <Handshake size={18} className="text-[#800000] shrink-0 mt-1" />
                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Platform Role:</span> We are a facilitator only. We do not participate in, control, or take responsibility for user interactions or their outcomes.</p>
               </div>
               <div className="flex gap-3">
                  <UserCheck size={18} className="text-[#800000] shrink-0 mt-1" />
                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">User Verification:</span> Members are solely responsible for conducting their own verification and background checks of any match.</p>
               </div>
               <div className="flex gap-3">
                  <ShieldCheck size={18} className="text-[#800000] shrink-0 mt-1" />
                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Active Monitoring:</span> We actively remove fraudulent profiles. However, we cannot guarantee the complete elimination of all fake profiles.</p>
               </div>
               <div className="flex gap-3">
                  <Search size={18} className="text-[#800000] shrink-0 mt-1" />
                  <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">No Guarantees:</span> We do not guarantee successful matchmaking, marriage, or the authenticity of profile information provided by others.</p>
               </div>
            </div>
          </div>
       </div>
    </div>

    <h3>1. Acceptance of Terms</h3>
    <p>By accessing or using Samta Matrimony, you agree to be bound by these Terms and Conditions. This platform is provided for matrimonial purposes only. Any use for dating, friendship, or commercial gain is strictly prohibited.</p>

    <h3>2. Eligibility</h3>
    <p>To register, you must be of legal marriageable age in India (minimum 18 years for females and 21 years for males). You must be legally competent to enter into a marriage contract under the laws of India.</p>

    <h3>3. Comprehensive Disclaimer of Liability</h3>
    <ul>
      <li><strong>Matchmaking Outcomes:</strong> Samta Matrimony provides tools and suggestions based on profile data. We do not guarantee that your search will result in a marriage or a successful alliance. Results are subject to mutual interest and individual discretion.</li>
      <li><strong>Information Accuracy:</strong> While we encourage all members to provide accurate details and offer basic verification badges, the information on profiles is self-reported. We are not responsible for inaccuracies or misrepresentations by members.</li>
      <li><strong>User Safety & Conduct:</strong> Members interact with others at their own risk. Samta Matrimony is not responsible for any direct, indirect, or consequential damages arising from interactions, physical meetings, or matrimonial alliances formed through the platform.</li>
      <li><strong>Active Profile Moderation:</strong> We employ manual screening and automated tools to identify and remove suspicious or fraudulent activity. Members are encouraged to report any profile that violates community standards. However, our moderation efforts do not constitute a guarantee of absolute safety.</li>
    </ul>

    <h3>4. User Responsibilities</h3>
    <ul>
      <li><strong>True Information:</strong> You agree to provide current, complete, and accurate information during registration and profile updates.</li>
      <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
      <li><strong>Safe Interaction:</strong> You are advised to exercise caution when communicating with strangers. Do not share financial information or perform bank transfers for any reason.</li>
    </ul>

    <h3>5. Prohibited Activities</h3>
    <p>Users are strictly prohibited from:</p>
    <ul>
      <li>Creating fake profiles, impersonating others, or providing false age/marital status.</li>
      <li>Harassing, abusing, or sending unsolicited commercial communications to other members.</li>
      <li>Harvesting or collecting member data for any purpose outside of matrimonial matchmaking.</li>
    </ul>

    <h3>6. Governing Law & Jurisdiction</h3>
    <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bharatpur, Rajasthan.</p>
  </PageWrapper>
);

export const ContactUs = () => (
  <div className="max-w-6xl mx-auto px-4 py-20">
    <MetaSEO title="Contact Us - Samta Matrimony" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div>
        <h1 className="text-5xl font-serif font-black text-[#800000] mb-4">Get in Touch</h1>
        <p className="text-slate-500 text-lg mb-12">Have questions? Our support team is available to assist you on your journey.</p>
        
        <div className="space-y-8">
           <div className="flex gap-6">
              <div className="w-14 h-14 bg-[#80000010] text-[#800000] rounded-2xl flex items-center justify-center shrink-0">
                 <Mail size={24} />
              </div>
              <div>
                 <p className="font-black text-slate-800">Email Us</p>
                 <p className="text-slate-500">support@samta-matrimony.com</p>
              </div>
           </div>
           <div className="flex gap-6">
              <div className="w-14 h-14 bg-[#80000010] text-[#800000] rounded-2xl flex items-center justify-center shrink-0">
                 <Phone size={24} />
              </div>
              <div>
                 <p className="font-black text-slate-800">Call Support</p>
                 <p className="text-slate-500">+91 8426914414</p>
              </div>
           </div>
           <div className="flex gap-6">
              <div className="w-14 h-14 bg-[#80000010] text-[#800000] rounded-2xl flex items-center justify-center shrink-0">
                 <MapPin size={24} />
              </div>
              <div>
                 <p className="font-black text-slate-800">Head Office</p>
                 <p className="text-slate-500">Ganesh Nagar, Bharatpur, Rajasthan – 321001</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100">
         <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#800000] outline-none" placeholder="Your name" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#800000] outline-none" placeholder="Email address" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subject</label>
               <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#800000] outline-none">
                  <option>General Inquiry</option>
                  <option>Report Profile</option>
                  <option>Technical Support</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
               <textarea rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:border-[#800000] outline-none" placeholder="How can we help?"></textarea>
            </div>
            <button className="w-full bg-[#800000] text-white py-4 rounded-2xl font-black shadow-xl hover:bg-[#600000] transition-all">
               Send Message
            </button>
         </form>
      </div>
    </div>
  </div>
);