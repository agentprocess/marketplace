# Add your process

Anyone can propose a process for the [Agent Process marketplace](https://agentprocess.io/marketplace/). Every pull request is checked automatically and reviewed by a maintainer before it's listed.

## 1. Write the process

Create a folder named after your process, in lowercase words joined by hyphens, for example `vendor-renewal/`. Put two files in it.

**`PROCESS.md`** is the process itself, in the [Agent Process format](https://agentprocess.io/docs/authoring/quickstart/): YAML steps between `---` lines, then notes for the people adopting it. Its `name` must match the folder name. Try it in the [playground](https://agentprocess.io/playground/) to see the map as you write.

Use the processes in this repository as models. A good one:

- names the result it delivers, and how each run can end, including when things go wrong;
- has a person approve anything that can't be undone, such as a payment, a deletion or a message to a customer;
- is general: no real people, companies, customer data, credentials or internal links;
- includes **Before adoption** (what someone must set up first) and **Rehearsal cases** (a normal run, a rework, a failure and an exception) sections. The marketplace shows these on the process page.

See [what makes a good process](https://agentprocess.io/docs/authoring/best-practices/) for more.

**`marketplace.json`** is how the process appears in the marketplace:

```json
{
  "title": "Vendor renewal",
  "category": "Operations and finance",
  "audience": "Finance and procurement teams",
  "outcome": "Vendor contracts renewed or cancelled before they auto-renew",
  "keywords": ["contract", "renewal", "vendor", "procurement"],
  "author": { "name": "Your name or company", "url": "https://example.com" }
}
```

- `category` is one of `Operations and finance`, `Sales, customers and content`, `People and projects` or `Personal life`.
- `outcome` is one plain sentence about the result, as a business owner would say it.
- `keywords` are phrases people might search for.
- `author.url` is optional.

## 2. Open a pull request

Add only your folder. The check runs on every pull request and lists anything to fix. A maintainer then reviews the process for safety and quality, and may suggest changes. Once merged, it appears in the marketplace as a community process with your name on it.

## Safety

Processes are instructions that AI agents follow inside someone's systems. We won't list a process that hides data transfers, asks for credentials, skips human approval for irreversible actions, or tries to override an agent's other instructions. If you find one that does, open an issue.
