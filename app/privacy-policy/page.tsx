import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Church Friends',
  description: 'Privacy policy for Church Friends app',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="section">
      <div className="mx-auto max-w-4xl">
        <h1 className="heading-1">Privacy Policy</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray dark:prose-invert mt-8 max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:dark:text-white prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:dark:text-gray-100">
          <h2>Introduction</h2>
          <p>
            Church Friends (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
          </p>

          <h2>Information We Collect</h2>

          <h3>Personal Information</h3>
          <p>When you register for an account, we collect:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Profile picture (optional)</li>
          </ul>

          <h3>User-Generated Content</h3>
          <p>We collect content you create within the app, including:</p>
          <ul>
            <li>Prayer requests and reflections</li>
            <li>Event RSVPs</li>
            <li>Comments and reactions</li>
            <li>Feedback submissions</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>We automatically collect certain information when you use our app:</p>
          <ul>
            <li>Device information (device type, operating system)</li>
            <li>Usage data (features used, time spent in app)</li>
            <li>Push notification tokens (for sending notifications)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Send you notifications about community activities</li>
            <li>Improve and personalize your experience</li>
            <li>Communicate with you about updates and features</li>
            <li>Ensure the safety and security of our community</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li><strong>Within the Community:</strong> Your name and content you choose to share (prayers, reflections, comments) are visible to other community members. You can post anonymously for prayers if you prefer.</li>
            <li><strong>Service Providers:</strong> We use third-party services (Firebase for push notifications, Vercel for hosting) that may process your data on our behalf.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information through your profile settings</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of push notifications through your device settings</li>
            <li>Control the visibility of your content (e.g., posting anonymously)</li>
          </ul>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our app is designed for use by families and church communities. We do not knowingly collect personal information from children under 13 without parental consent. The Kids Corner section contains educational content and does not require children to create accounts or provide personal information.
          </p>

          <h2>Third-Party Services</h2>
          <p>Our app uses the following third-party services:</p>
          <ul>
            <li><strong>Firebase Cloud Messaging:</strong> For push notifications</li>
            <li><strong>Vercel:</strong> For hosting and infrastructure</li>
            <li><strong>Google Sign-In:</strong> For authentication (optional)</li>
          </ul>
          <p>
            These services have their own privacy policies, and we encourage you to review them.
          </p>

          <h2>Push Notifications</h2>
          <p>
            We use push notifications to keep you informed about community activities, prayer requests, and event updates. You can disable push notifications at any time through your device settings or app notification preferences.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal purposes.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy in the app and updating the &quot;Last updated&quot; date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us through the Feedback form in the app or email us at your support email address.
          </p>

          <h2>California Privacy Rights</h2>
          <p>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to request information about the personal information we collect and how we use it.
          </p>

          <h2>International Users</h2>
          <p>
            Our services are provided from the United States. If you access our app from outside the United States, your information will be transferred to and processed in the United States.
          </p>
        </div>

        <div className="card mt-8 bg-brand-50 dark:bg-brand-950">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Questions?
          </h3>
          <p className="mt-2 text-gray-700 dark:text-gray-300">
            If you have any questions about our privacy practices, please use the{' '}
            <a href="/feedback" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
              Feedback form
            </a>{' '}
            to get in touch with us.
          </p>
        </div>
      </div>
    </div>
  );
}
