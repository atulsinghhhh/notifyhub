'use client';

import { useState } from 'react';

const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.notifyhub.dev/v1/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "user@example.com",
    "template": "welcome-email",
    "channel": "email",
    "data": {
      "name": "Sarah",
      "company": "Acme Inc"
    }
  }'`,
  node: `import { NotifyHub } from '@notifyhub/sdk';

const client = new NotifyHub({
  apiKey: process.env.NOTIFYHUB_API_KEY
});

await client.send({
  recipient: 'user@example.com',
  template: 'welcome-email',
  channel: 'email',
  data: {
    name: 'Sarah',
    company: 'Acme Inc'
  }
});`,
  python: `from notifyhub import NotifyHub

client = NotifyHub(
  api_key=os.environ['NOTIFYHUB_API_KEY']
)

client.send(
  recipient='user@example.com',
  template='welcome-email',
  channel='email',
  data={
    'name': 'Sarah',
    'company': 'Acme Inc'
  }
)`,
};

export default function CodePreview() {
  const [activeTab, setActiveTab] = useState<keyof typeof CODE_EXAMPLES>('curl');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg overflow-hidden shadow-xl">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          {Object.keys(CODE_EXAMPLES).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang as keyof typeof CODE_EXAMPLES)}
              className={`px-4 py-1.5 rounded text-sm font-mono transition-colors ${
                activeTab === lang
                  ? 'bg-[var(--bg-elevated)] text-blue-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Code */}
        <div className="p-6 overflow-x-auto">
          <pre className="font-mono text-sm text-[var(--text-secondary)] leading-relaxed">
            <code>{CODE_EXAMPLES[activeTab]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
