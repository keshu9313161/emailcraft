export interface EmailParams {
  templateId: string;
  recipientName: string;
  recipientPronouns: string;
  context: string;
  tone: string;
  length: string;
  yourName: string;
  yourTitle: string;
  yourCompany: string;
  signOff: string;
  yourPronouns: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

type ToneGroup = "formal" | "casual" | "warm" | "direct" | "sensitive";

function getToneGroup(tone: string): ToneGroup {
  if (["Formal", "Professional"].includes(tone)) return "formal";
  if (["Direct", "Assertive"].includes(tone)) return "direct";
  if (["Apologetic", "Diplomatic", "Empathetic"].includes(tone))
    return "sensitive";
  if (["Warm", "Enthusiastic", "Friendly"].includes(tone)) return "warm";
  return "casual";
}

function greeting(recipientName: string, tone: string): string {
  const tg = getToneGroup(tone);
  const name = recipientName || "[their name]";
  if (tg === "formal") return `Dear ${name},`;
  if (tg === "warm") return `Hi ${name}!`;
  if (tg === "casual") return `Hey ${name},`;
  return `Hi ${name},`;
}

function signature(params: EmailParams): string {
  const sign = params.signOff || "Best regards";
  const name = params.yourName || "[your name]";
  const titleLine =
    params.yourTitle && params.yourCompany
      ? `${params.yourTitle}, ${params.yourCompany}`
      : params.yourTitle || params.yourCompany || "";
  return titleLine ? `${sign},\n${name}\n${titleLine}` : `${sign},\n${name}`;
}

function pronounRef(
  pronouns: string,
  form: "subject" | "object" | "possessive",
): string {
  const map: Record<string, [string, string, string]> = {
    "she/her": ["she", "her", "her"],
    "he/him": ["he", "him", "his"],
    "they/them": ["they", "them", "their"],
    "don't specify": ["they", "them", "their"],
  };
  const lower = pronouns?.toLowerCase() || "they/them";
  const entry = map[lower] || ["they", "them", "their"];
  if (form === "subject") return entry[0];
  if (form === "object") return entry[1];
  return entry[2];
}

// ─── Template generators ───────────────────────────────────────────────────

function afterMeeting(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const long = p.length === "Long";
  const subject = "Following up from our meeting";

  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  const context = p.context ? ` — ${p.context}` : "";

  let body: string;

  if (tg === "formal") {
    body = `${greet}

Thank you for taking the time to meet with me${context}. I wanted to follow up on the key points we discussed.

[Summarise the main topics or decisions covered in the meeting.]${
      long
        ? `

I have outlined the agreed next steps below:

- [Action item 1] — [Responsible party, deadline]
- [Action item 2] — [Responsible party, deadline]
- [Action item 3] — [Responsible party, deadline]

Please do not hesitate to reach out should you have any questions or require any clarification.`
        : short
          ? ""
          : `

Next steps:
- [Action item 1] — [responsible person]
- [Action item 2] — [responsible person]

Please let me know if I've missed anything or if you'd like to adjust any of the above.`
    }

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Following up on our meeting${context}. Here's what we covered and what happens next.

[Key decisions made.]

Next steps:
- [Action item 1] → [owner]
- [Action item 2] → [owner]${
      long
        ? `
- [Action item 3] → [owner]
- [Action item 4] → [owner]

Deadline: [date]. Let me know if anything is off.`
        : ""
    }

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

So great catching up with you${context}! Just wanted to jot down a quick summary of what we talked about so we're on the same page.

[Share what you discussed — keep it conversational.]
${
  !short
    ? `
Here's what we said we'd do next:

- [Action item 1] — [person taking it on]
- [Action item 2] — [person taking it on]${
        long
          ? `
- [Action item 3] — [person taking it on]

Let me know if I forgot anything! Happy to jump on a quick call if anything needs clarifying.`
          : `

Excited to keep the momentum going!`
      }`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thanks for the meeting${context}! Here's a quick recap of what we covered:

[Brief summary of discussion points.]
${
  !short
    ? `
Next up:
- [Action item] — [who's on it]
- [Action item] — [who's on it]${
        long
          ? `

Any corrections or additions, just let me know. Happy to chat if anything's unclear!`
          : ""
      }`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function noResponseNudge(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Following up on my previous email";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

Following up on my email from [date] regarding [the topic of your original email] — I haven't heard back and wanted to check in.

I understand you may be busy, but I would greatly appreciate it if you could let me know your thoughts when you have a moment.
${
  !short
    ? `
[Add any relevant context or updated information here.]

Thank you for your time, and I look forward to hearing from you.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Following up on my email from [date] about [topic]. Haven't heard back — just want to confirm you received it.

Could you let me know by [date]? If priorities have shifted, happy to reschedule.${
      !short
        ? `

[Add any relevant details or updated context here.]`
        : ""
    }

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hope you're doing well! I just wanted to pop back in and see if you had a chance to look at my email about [topic].

No pressure at all — I know things get busy! Just wanted to make sure it didn't get lost in the inbox.${
      !short
        ? `

[Feel free to add anything that might help them respond more easily.]

Looking forward to connecting!`
        : ""
    }

${sig}`;
  } else {
    body = `${greet}

Just circling back on my email from [date] about [topic] — wanted to check if you had a chance to look it over?

Feel free to reply when you get a moment!${
      !short
        ? `

[Add any additional context if helpful.]`
        : ""
    }

${sig}`;
  }

  return { subject, body: body.trim() };
}

function afterApplying(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Following up on my application for [job title]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to follow up on my application for the [job title] position, which I submitted on [date]. I remain very interested in the opportunity and am enthusiastic about the possibility of contributing to [company name].
${
  !short
    ? `
I would welcome the chance to discuss how my experience in [relevant area] aligns with your requirements. Please do not hesitate to contact me should you require any additional information.

Thank you for your consideration.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I applied for [job title] on [date] and wanted to follow up. I'm still very interested in the role and confident I can contribute to [company name].

Are you still reviewing applications? Happy to provide any additional info you need.${
      !short
        ? `

[Add a specific reason why you're a strong fit here.]`
        : ""
    }

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

I just wanted to follow up on my application for [job title] — I sent it over on [date] and I'm still really excited about the opportunity!

I'd love the chance to chat and share a bit more about why I think [company name] would be a great fit.${
      !short
        ? `

[Mention one specific thing about the company or role that excites you.]

Thanks so much for your time!`
        : ""
    }

${sig}`;
  } else {
    body = `${greet}

Just following up on my application for [job title] from [date]. Still really keen on the role and would love to connect!

Let me know if you need anything else from me.${
      !short
        ? `

[Briefly reiterate one key strength or reason you're a good fit.]`
        : ""
    }

${sig}`;
  }

  return { subject, body: body.trim() };
}

function introduction(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Introduction — ${p.yourName || "[your name]"}${p.yourTitle ? `, ${p.yourTitle}` : ""}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

My name is ${p.yourName || "[your name]"}, and I am [describe your role and organisation briefly].

I'm getting in touch because [reason for making contact — shared connection, mutual interest, etc.].
${
  !short
    ? `
[Describe what you do and why it might be relevant or interesting to them.]

I would be delighted to connect and explore whether there are any opportunities to work together or simply exchange ideas. Please feel free to reach out at your convenience.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I'm ${p.yourName || "[your name]"}, [role] at [company]. I'm reaching out because [specific reason].

[State your value proposition or reason for connecting clearly.]
${
  !short
    ? `
Would you be open to a brief call this week? I think there's a genuine opportunity here for [mutual benefit].`
    : "Open to connecting?"
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hi! I'm ${p.yourName || "[your name]"} — [brief, friendly description of what you do and where].

I came across [how you found them] and immediately felt like we should connect. [Explain why you admire their work or what caught your attention.]
${
  !short
    ? `
[Share a little about yourself and what you're working on.]

Would love to connect — even a quick virtual coffee would be wonderful!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Name's ${p.yourName || "[your name]"} — I'm [brief description of what you do].

[Explain why you're reaching out and what you'd love to discuss.]
${
  !short
    ? `
Would you be up for a quick chat sometime? I think it could be a great conversation.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function requestFeedback(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Feedback request — [name of project/work]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I hope you are well. I am writing to request your feedback on [name of project, document, or work], which I have attached for your review.

I would be most grateful for your honest assessment, particularly regarding [specific aspect you'd like reviewed].
${
  !short
    ? `
I have a deadline of [date], so any thoughts you could share by [earlier date] would be very helpful.

[Describe briefly what the work is and any relevant context.]

I value your perspective greatly and look forward to your insights.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Could you review [project/work] and share your feedback by [date]?

Specifically looking for input on:
- [Area 1]
- [Area 2]${
      !short
        ? `
- [Area 3]

[Any relevant context the reviewer should know.]

Honest feedback appreciated — the more direct, the better.`
        : ""
    }

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hope you're doing well! I'd love to get your thoughts on [project/work] — I've been working hard on it and your perspective would mean a lot.

[Describe what you'd like them to look at and why you value their opinion.]
${
  !short
    ? `
No pressure on length or detail — even a few bullet points would be incredibly helpful. I'm hoping to wrap things up by [date], so whenever you get a chance before then would be brilliant.

Thanks so much in advance!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Would you mind taking a look at [project/work] and sharing what you think? I'd really value your input.

Mostly curious about: [specific aspect]
${
  !short
    ? `
[Any context that would help them review it.]

Aiming to finish by [date], so any feedback before then would be super helpful. Thanks!`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function projectUpdate(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Project update — [project name]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to provide an update on [project name].

Current status: [describe the current state of the project — on track, delayed, completed a milestone, etc.]
${
  !short
    ? `
Key developments since the last update:
- [Development 1]
- [Development 2]

Outstanding items / blockers:
- [Blocker or pending item 1]
- [Blocker or pending item 2]

Anticipated next steps:
- [Next step 1] — [estimated completion date]
- [Next step 2] — [estimated completion date]

Please do not hesitate to reach out if you have any questions or require further detail.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Project update on [project name]:

Status: [on track / at risk / blocked]

Done:
- [Completed item 1]
- [Completed item 2]

Blockers:
- [Blocker 1] — needs: [what's needed to resolve]
${
  !short
    ? `
Next:
- [Next action 1] — [owner, due date]
- [Next action 2] — [owner, due date]

[Any decision you need from the recipient?]`
    : ""
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Just wanted to share a quick update on how [project name] is going!

The good news: [highlight a positive development].

[Describe the overall status and what the team has been working on.]
${
  !short
    ? `
A couple of things we're working through:
- [Challenge or blocker 1]
- [Challenge or blocker 2]

Here's what's coming up next:
- [Upcoming milestone or task]
- [Upcoming milestone or task]

Let me know if you have any questions or want to dig into anything!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Here's a quick update on [project name]:

[Brief status — what's done, what's next, any blockers.]
${
  !short
    ? `
Coming up:
- [Next action 1]
- [Next action 2]

Any questions, just let me know!`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function partnershipPitch(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Partnership opportunity — ${p.yourCompany || "[your company]"}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  const context = p.context ? ` — ${p.context}` : "";

  let body: string;
  if (tg === "formal") {
    body = `${greet}

My name is ${p.yourName || "[your name]"}, ${p.yourTitle ? `${p.yourTitle} at ` : ""}${p.yourCompany || "[your company]"}. I'm writing with a specific partnership idea that I believe would benefit both of our organisations.

[Describe what your organisation does and why you believe there is alignment.]
${
  !short
    ? `
Specifically, I believe we could work together to [describe the nature of the partnership and the value it would create for both parties].

I would welcome the opportunity to arrange a brief introductory call at a time that suits you to discuss this further.

Thank you for your time and consideration.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I'm ${p.yourName || "[your name]"} from ${p.yourCompany || "[your company]"}. I'll keep this brief.

We [brief description of what you do]. I think there's a clear opportunity for us to work together on [specific area].

The benefit to you: [what they get]
The benefit to us: [what you get]
${
  !short
    ? `
[Add any data, examples, or specifics that strengthen the case.]

Open to a 20-minute call this week to explore this?`
    : "Worth a call?"
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hope you're having a great [day/week]! I'm ${p.yourName || "[your name]"} from ${p.yourCompany || "[your company]"}${context}, and I've been following [their company/work] for a while now — honestly love what you're building.

Here's the idea: [Describe the partnership idea and why it excites you.]
${
  !short
    ? `
[Share the mutual benefit clearly and enthusiastically.]

Would you be up for a quick 20-minute call to explore this? No pressure — I just think this could be something special for both of us!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'm ${p.yourName || "[your name]"} from ${p.yourCompany || "[your company]"}. I've been looking at what you're doing at [their company] and I think we could do something interesting together.

[Explain the partnership idea simply and clearly.]
${
  !short
    ? `
Both sides stand to gain: [quick summary of mutual benefit].

Would you be open to a quick call? Happy to work around your schedule.`
    : "Interested in a quick chat?"
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function informationalInterview(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const pron = p.recipientPronouns || "they/them";
  const their = pronounRef(pron, "possessive");
  const subject = "Informational interview request";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I hope you are well. My name is ${p.yourName || "[your name]"}, and I have been following your work in [their field/industry] with great admiration — particularly [specific piece of work, achievement, or contribution you admire].

I am currently [describe your situation — studying, transitioning careers, exploring a field] and would be enormously grateful for the opportunity to speak with you briefly about ${their} experience and journey.
${
  !short
    ? `
I fully appreciate how busy you are and would only ask for 20 minutes of your time at your convenience — whether by phone, video, or in person, whichever suits you best.

Thank you very much for considering this request.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I'm ${p.yourName || "[your name]"}. I've admired your work in [field] — specifically [specific achievement]. I'm [briefly, your current situation] and looking to learn from people doing what you do.

Could I get 20 minutes of your time for a quick informational call?
${
  !short
    ? `
Happy to work entirely around your schedule. I'll come prepared with specific questions and keep it tight.

Thank you.`
    : ""
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hope this finds you well! I'm ${p.yourName || "[your name]"} and I've been such a fan of your work — [mention something specific that inspired or impressed you].

I'm [describe your situation/journey] and honestly, the way you've built your career in [their field] is something I find really inspiring.
${
  !short
    ? `
I know you're incredibly busy, so I completely understand if now isn't a great time — but would you be open to a 20-minute chat sometime? I'd love to hear about your journey and any advice you might have.

Thanks so much for even considering it!`
    : "20 minutes of your time?"
}

${sig}`;
  } else {
    body = `${greet}

I've been following your work in [field] — [something specific you appreciate about it]. I'm ${p.yourName || "[your name]"}, currently [brief description of your situation].

Would you be up for a 20-minute chat? I'd love to learn about your experience and get your perspective on [specific topic].
${
  !short
    ? `
No agenda other than a genuine conversation — happy to work around your schedule.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function salesIntro(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "[Company name] — a quick introduction";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

My name is ${p.yourName || "[your name]"}, ${p.yourTitle ? `${p.yourTitle} at ` : ""}${p.yourCompany || "[your company]"}.

I'm contacting you specifically because [reason why this is relevant to them specifically]. We specialise in [brief description of your product/service] and have helped organisations such as [similar client or industry] to [achieve a specific result].
${
  !short
    ? `
[One or two sentences describing the core value proposition.]

I would welcome the opportunity to arrange a brief exploratory conversation to see whether our offering might be relevant to your organisation.

Thank you for your time.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

${p.yourCompany || "[Your company]"} helps [type of business] [achieve specific outcome]. I'm reaching out because [specific reason it's relevant to them].

We've helped [type of client] [achieve result, e.g. "reduce costs by X%" or "save Y hours per week"].
${
  !short
    ? `
[Add one more specific and compelling data point.]

Worth 15 minutes to see if there's a fit?`
    : "Worth a look?"
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Hope you're well! I'm ${p.yourName || "[your name]"} from ${p.yourCompany || "[your company]"}.

I came across [their company/work] and was genuinely impressed by [something specific]. That's why I thought you might find what we're doing interesting.

We help [type of business] [achieve outcome] — [brief friendly description of what you offer].
${
  !short
    ? `
[Share a quick proof point or customer story.]

No hard sell here — would just love to have a chat and see if there's any overlap. Open to a quick 15-minute call?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'll keep this short: ${p.yourCompany || "[your company]"} helps [type of business] [do what]. Thought it might be relevant given [reason].

[One-sentence proof point or result.]
${
  !short
    ? `
Would a 15-minute call be worth your while? Happy to go whenever suits you.`
    : "Worth 15 minutes?"
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function apology(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "My sincere apologies";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal" || tg === "sensitive") {
    body = `${greet}

I am writing to sincerely apologise for [what happened]. I take full responsibility and deeply regret the impact this has had on you.

[Acknowledge specifically what went wrong and why it was unacceptable.]
${
  !short
    ? `
I want to assure you that this is not a reflection of the standard I hold myself to. I have taken the following steps to ensure this does not happen again:

- [Step 1]
- [Step 2]

[Describe what you will do to make it right, if applicable.]

I hope you will allow me the opportunity to rebuild your trust.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I want to apologise directly for [what happened]. It was wrong and I own that fully.

[State clearly what you did and why it was a problem.]

Here's what I'm doing about it: [specific action or change].
${
  !short
    ? `
I'm committed to making this right. [Describe how.]

If you'd like to talk through it, I'm available whenever works for you.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'm really sorry about [what happened]. I know that's not good enough on its own, but I want you to know I genuinely mean it.

[Explain what happened honestly, without making excuses.]
${
  !short
    ? `
I've been thinking about what I could have done differently, and I'm going to [describe what you'll change or do differently going forward].

[If appropriate, suggest how you'd like to make it right.]

Thank you for your patience, and I hope we can move forward.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function decliningPolitely(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Re: [original subject]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal" || tg === "sensitive") {
    body = `${greet}

Thank you sincerely for thinking of me and for the kind invitation to [describe the opportunity or request]. After careful consideration, I regret that I am unable to commit at this time due to [brief reason — existing commitments, capacity, etc.].
${
  !short
    ? `
This is in no way a reflection of the quality of [the project/opportunity], which I found genuinely impressive. I hope you are able to find the right person for this.

[If appropriate: "Should circumstances change, I would be open to revisiting this in the future."]

I wish you every success with it.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Thank you for the offer — I'm going to have to decline.

Reason: [brief, honest reason].
${
  !short
    ? `
[If applicable: suggest an alternative person or approach.]

Best of luck with it.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Really appreciate you thinking of me for [opportunity/request] — that genuinely means a lot!

Unfortunately I'm going to have to pass this time. [Honest, friendly reason.]
${
  !short
    ? `
[Optional: Suggest someone else, or offer an alternative way you could help.]

Hope it all comes together brilliantly — you deserve it!`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function difficultFeedback(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Some thoughts I wanted to share with you";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal" || tg === "sensitive") {
    body = `${greet}

I have some feedback I'd like to share with you directly. It may be difficult to hear, but I believe it will be useful.

Firstly, I want to acknowledge [something positive about their work or effort].
${
  !short
    ? `
My concern relates to [describe the specific issue clearly and factually]. I have observed [specific examples] and feel it is important to raise this with you directly.

[Suggest a constructive path forward or offer support.]

I raise this in the spirit of honest and supportive communication, and I hope we can find a way forward together.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I want to be straightforward with you about something, because I respect you enough to be honest.

[State the concern clearly and factually, without softening it to the point of obscuring the message.]

Here's what I think would help: [specific, actionable suggestion].
${
  !short
    ? `
[Add any relevant context or examples that support the feedback.]

I'm happy to talk through this in more detail if that would be useful.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I've been wanting to talk to you about something, and I hope you know it's coming from a place of genuine care.

[Acknowledge their effort or strengths first.]

The thing I've been noticing is [describe the issue honestly but gently].
${
  !short
    ? `
[Share a specific example to ground it in reality.]

I think with a small shift in [area], you could really [positive outcome]. Would love to chat about it if you're open to it.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function thankYou(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Thank you";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to express my sincere gratitude for [what they did]. It made a genuine difference and I am deeply appreciative.
${
  !short
    ? `
In particular, [describe specifically what helped and how it impacted you or the situation].

Your [kindness/support/expertise/time] is something I will not forget.

Thank you once again.`
    : ""
}

${sig}`;
  } else if (tg === "warm" || tg === "sensitive") {
    body = `${greet}

I just wanted to reach out and say a heartfelt thank you for [what they did]. It honestly meant more to me than I can easily express.
${
  !short
    ? `
Specifically, [describe what they did and the concrete difference it made].

I feel incredibly lucky to have [someone like you / your support / your friendship]. Thank you from the bottom of my heart.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Just wanted to say a big thank you for [what they did]. It genuinely made a difference!
${
  !short
    ? `
[Be specific — what did they do and how did it help you?]

Really appreciate it.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function congratulations(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Congratulations!";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to extend my warmest congratulations on [their achievement]. This is a tremendous accomplishment and a true testament to your dedication and hard work.
${
  !short
    ? `
[Describe specifically what makes this achievement significant and what it says about them.]

I have no doubt that this is just the beginning of even greater things to come. Please accept my sincerest congratulations.`
    : ""
}

${sig}`;
  } else if (tg === "warm" || tg === "sensitive") {
    body = `${greet}

Oh my goodness — congratulations on [their achievement]! I'm honestly so thrilled for you!
${
  !short
    ? `
[Tell them specifically why this achievement is so meaningful and what you think it reflects about them as a person.]

You deserve every bit of this and so much more. So proud of you!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Huge congratulations on [their achievement]! Seriously, so well deserved.
${
  !short
    ? `
[Mention what makes the achievement impressive and what it means for their future.]

Celebrate — you've earned it!`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

function checkingIn(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Checking in";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);

  let body: string;
  if (tg === "formal") {
    body = `${greet}

It's been some time since we last spoke — I'm writing to reconnect and hear how you are getting on.
${
  !short
    ? `
[Mention any relevant context — what you've been up to, or what prompted you to reach out now.]

I would be delighted to reconnect at your convenience, whether by email or a brief call.`
    : ""
}

${sig}`;
  } else if (tg === "warm" || tg === "sensitive") {
    body = `${greet}

Hi! You came to mind recently and I realised it's been way too long — genuinely curious to hear what you've been up to!
${
  !short
    ? `
[Share a little about what's been going on with you, and genuinely invite them to share their news too.]

Would love to hear how things are going. No pressure — just wanted you to know you're in my thoughts!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Hey — I know it's been a while! Hope you're doing well.
${
  !short
    ? `
[Share a quick update on yourself and express genuine curiosity about how they're doing.]

No need for a big catch-up — just wanted to say hi and let you know I'm thinking of you.`
    : ""
}

${sig}`;
  }

  return { subject, body: body.trim() };
}

// ─── Main export ───────────────────────────────────────────────────────────

// ─── New Follow-up templates ──────────────────────────────────────────────

function afterInterview(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Thank you for the interview — [job title]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to sincerely thank you for taking the time to interview me for the [job title] position on [date].

It was a pleasure to learn more about the role and the team, and I was particularly interested in [something specific discussed in the interview].
${
  !short
    ? `
I remain very enthusiastic about this opportunity and believe that my experience in [relevant area] would allow me to contribute meaningfully from the outset.

Please do not hesitate to contact me should you require any additional information. I look forward to hearing from you.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Thank you for the interview for [job title] on [date]. It was a productive conversation and I'm still very interested in the role.

[Reference something specific from the conversation that resonated with you.]
${
  !short
    ? `
I'm confident I can [specific contribution]. Happy to provide any additional info you need.`
    : ""
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

I just wanted to say a big thank you for the interview for [job title] — I really enjoyed our conversation, especially [specific topic or moment from the interview].

I came away even more excited about the role and the team!
${
  !short
    ? `
[Share one specific thing that stood out and reinforces why you'd be a great fit.]

I'm really hoping to hear back soon — thanks again for your time!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thanks so much for the interview for [job title] on [date]! Really enjoyed hearing more about [something discussed], and it made me even more keen on the role.

[Briefly mention one thing that reaffirmed your interest.]
${
  !short
    ? `
Looking forward to hearing back — happy to provide anything else you need in the meantime!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function afterEvent(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Great connecting at [event name]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

It was a pleasure to meet you at [event name] on [date]. I greatly enjoyed our conversation and wanted to follow up as promised.

[Summarise the key points of your discussion.]
${
  !short
    ? `
[Mention any next steps or actions you both agreed to, or express interest in continuing the conversation.]

I would be delighted to stay in touch. Please do not hesitate to reach out at any time.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Good to meet you at [event name]. Following up as we discussed — [summarise what you talked about and the agreed next step].

[State clearly what you'd like to do next and why.]
${
  !short
    ? `
Worth a call this week to move things forward?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

It was really great meeting you at [event name]! I enjoyed our chat about [topic] and wanted to follow up while it was fresh.

[Share what you took away from the conversation and why you'd like to stay connected.]
${
  !short
    ? `
[Suggest a specific next step — a call, coffee, or just staying connected on LinkedIn.]

Looking forward to keeping in touch!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function afterDemo(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Following up on your demo";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Thank you for taking the time to attend our product demonstration on [date]. I hope it gave you a useful overview of how [product/service] can support your objectives.

[Summarise the key points covered and any questions raised during the demo.]
${
  !short
    ? `
I would be happy to arrange a follow-up call to discuss next steps, answer any outstanding questions, or provide a more tailored demonstration if that would be helpful.

I look forward to hearing your thoughts.`
    : ""
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

Thanks for attending the demo on [date]. Here's a quick summary of what we covered:

[Bullet points of key features shown and questions raised.]
${
  !short
    ? `
Next step: [propose a specific next action — trial, proposal, call].

What's your timeline for a decision?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thanks for joining the demo on [date]! Hope it gave you a good sense of what [product/service] can do.

[Reference something specific from the demo that seemed to resonate with them.]
${
  !short
    ? `
I'd love to answer any questions that came up after, or walk through anything in more detail.

What are your next steps on your end?`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New Professional templates ───────────────────────────────────────────

function meetingRequest(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Meeting request — [topic]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I'd like to schedule a meeting to discuss [topic/purpose].

[Provide brief context on why the meeting is needed and what you hope to achieve.]
${
  !short
    ? `
I would suggest the following times, though I am happy to accommodate your schedule:

- [Option 1: Day, Date, Time, Duration]
- [Option 2: Day, Date, Time, Duration]

Please let me know which option works best for you, or suggest an alternative if neither is convenient.`
    : "Would [date/time] work for you?"
}

${sig}`;
  } else if (tg === "direct") {
    body = `${greet}

I'd like to schedule a meeting to discuss [topic]. It should take around [duration].

Suggested times:
- [Option 1]
- [Option 2]
${
  !short
    ? `
Agenda: [brief bullet points of what you'd like to cover.]

Does one of those work?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'd love to find some time to chat about [topic] — would you be up for a meeting?

[Provide a brief reason why and what you'd like to cover.]
${
  !short
    ? `
I'm thinking [duration] should be enough. Here are a few times that work for me:

- [Option 1]
- [Option 2]

Happy to work around your schedule too — just let me know!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function statusReport(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Status report — [project/period]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Please find below a status update for [project name] as of [date].

**Completed:**
- [Task or milestone completed]
- [Task or milestone completed]

**In Progress:**
- [Task currently underway] — expected completion: [date]
${
  !short
    ? `
**Blockers / Risks:**
- [Any issues or dependencies affecting progress]

**Next Steps:**
- [Planned activity for the coming period]
- [Planned activity for the coming period]

Please do not hesitate to reach out if you require any clarification or have concerns.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Here's a quick status update on [project/period]:

✅ **Done:** [key completed items]
🔄 **In progress:** [what's currently being worked on]
${
  !short
    ? `⚠️ **Blockers:** [anything that's slowing things down or needs a decision]
📅 **Next:** [upcoming priorities]

Let me know if you have any questions or want to discuss anything in more detail.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function proposalSummary(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Proposal: [project/idea name]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am pleased to submit the following proposal for your consideration.

**Objective:** [State the goal or problem being addressed.]

**Proposed Approach:** [Describe the solution or plan at a high level.]
${
  !short
    ? `
**Expected Outcomes:**
- [Outcome 1]
- [Outcome 2]

**Timeline:** [Proposed start date, key milestones, and completion date.]

**Resources Required:** [Budget, people, or tools needed.]

I would welcome the opportunity to discuss this proposal in more detail at your convenience.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'd like to propose [idea/project name] — here's a quick overview:

**What:** [One sentence description of the proposal.]
**Why:** [The problem it solves or opportunity it captures.]
**How:** [High-level approach.]
${
  !short
    ? `
**Expected outcome:** [What success looks like.]
**Timeline:** [Key dates or phases.]

Happy to discuss this in more detail — let me know your thoughts!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function escalation(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Escalation: [issue name]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to formally escalate the following issue: [issue name/description].

**Background:** [Brief summary of the issue, when it started, and steps already taken to resolve it.]

**Current Impact:** [Describe the impact on the project, team, customers, or business.]
${
  !short
    ? `
**Actions Taken to Date:**
- [Action 1]
- [Action 2]

**Requested Action:** [Clearly state what you need the escalation recipient to do or decide.]

I would appreciate your urgent attention to this matter. Please let me know if you need any further information.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I need to escalate an issue that requires your attention: [issue name].

**The problem:** [Clear, concise description of what's wrong.]
**Impact:** [What's being affected and how seriously.]
${
  !short
    ? `
**What's been tried:** [Actions taken so far.]
**What I need from you:** [Specific decision or action requested.]

I want to resolve this quickly — can we connect today or tomorrow?`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function handover(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Handover notes — [role/project]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Please find below my handover notes for [role/project] as of [date].

**Overview:** [Brief description of the role or project scope.]

**Current Status:** [Where things stand at time of handover.]
${
  !short
    ? `
**Key Contacts:**
- [Name, role, contact details]
- [Name, role, contact details]

**Outstanding Items:**
- [Task or issue that needs attention]
- [Task or issue that needs attention]

**Important Documents / Access:**
- [Location of key files, systems, or credentials to be transferred]

Please do not hesitate to reach out if anything is unclear or if you need additional context.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Here are my handover notes for [role/project]:

**What's in progress:** [Active tasks and their current state.]
**What needs doing next:** [Immediate priorities for whoever takes over.]
${
  !short
    ? `
**Key people to know:**
- [Name] — [role and why they matter]
- [Name] — [role and why they matter]

**Where to find things:** [Key docs, systems, or logins.]

**Anything to watch out for:** [Potential issues or sensitivities.]

I'm happy to do a handover call to walk through anything that's not clear.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New Cold Outreach templates ─────────────────────────────────────────

function investorOutreach(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "[Company] — brief introduction";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

My name is ${p.yourName || "[your name]"}, [role] at [company name]. I'm reaching out because [company name]'s focus on [relevant theme] caught my attention and I believe our work is directly relevant.

[Company name] is [one-sentence description of what you do and the market you serve].
${
  !short
    ? `
**Traction:** [Key metrics — revenue, users, growth rate.]
**Ask:** [Funding amount and what it will be used for.]
**Why now:** [Market timing or catalyst.]

I would welcome the opportunity to share our deck and answer any questions you may have. Would you be open to a brief introductory call?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I'll keep this short. ${p.yourName || "[Your name]"} here, [role] at [company].

We're [one-sentence elevator pitch — what you do, for whom, and why it matters].
${
  !short
    ? `
**Numbers:** [Key traction metrics.]
**Raising:** [Amount] to [purpose].

We're speaking with a handful of investors right now. Would love to share more if this is in your wheelhouse. Deck available on request.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function speakerInvitation(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Speaker invitation — [event name]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

On behalf of [organisation/event name], I am delighted to invite you to speak at [event name], taking place on [date] in [location/online].

We have been following your work in [their field] with great interest, and we believe your perspective would be of significant value to our audience of [brief description of attendees].
${
  !short
    ? `
**Proposed topic:** [Suggested topic or open to their preference.]
**Format:** [Keynote / panel / workshop, duration.]
**Audience:** [Size and profile.]

We would be very pleased to discuss speaking fees, travel arrangements, and any other requirements you may have.

We do hope you will be able to join us.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

We'd love to have you speak at [event name] on [date]!

Your work on [specific topic] is exactly the kind of thinking our audience of [attendee description] would find incredibly valuable.
${
  !short
    ? `
**What we're thinking:** [Topic suggestion or open to ideas.]
**Format:** [Keynote / panel, duration.]
**Details:** [Location/virtual, audience size.]

We'd cover [compensation/expenses if applicable]. Would you be interested? Happy to jump on a call to discuss!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function mediaPitch(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Story idea: [brief hook]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to pitch a story that I believe would resonate strongly with your readership.

**The hook:** [One compelling sentence that captures why this story matters now.]

**The angle:** [The unique perspective or narrative you're proposing.]
${
  !short
    ? `
**Why now:** [Current events, data, or trends that make this timely.]

**Sources available:** [Who can speak to this — experts, data, case studies.]

I would be very happy to provide additional background, a more detailed briefing, or arrange interviews at your convenience.

Thank you for considering this.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I have a story idea that I think would be perfect for [publication/outlet].

**The story:** [One or two sentences on what it's about and why it's interesting.]
**The angle:** [What makes this unique or timely.]
${
  !short
    ? `
**Why now:** [Relevant trend, data point, or news hook.]
**I can offer:** [Access, data, interviews, or exclusive material.]

Happy to send more background if you're interested. Would this work for you?`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New Sensitive templates ─────────────────────────────────────────────

function resignation(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Resignation — ${p.yourName || "[your name]"}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to formally notify you of my resignation from my position as [job title] at [company name], effective [last working day, typically notice period from today's date].

[Optional: brief, professional reason for leaving — e.g. "to pursue a new opportunity" or "for personal reasons."]
${
  !short
    ? `
I am committed to ensuring a smooth transition and am happy to assist in any way I can during my notice period, including handover of my current responsibilities.

It has been a privilege to work with you and the team, and I am grateful for the opportunities and support I have received during my time here.

Thank you for everything.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I wanted to let you know that I am resigning from my role as [job title], with my last day being [date].

[A sentence or two about why, if you're comfortable sharing, and a genuine note of thanks.]
${
  !short
    ? `
I'm committed to making this transition as smooth as possible — happy to help with handover or training my replacement in any way that's useful.

Thank you for everything. It's been a great experience and I'll take a lot from my time here.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function complaint(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Formal complaint — [issue]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to formally raise a complaint regarding [issue].

**Details of the complaint:**
[Provide a clear, factual account of what happened, including dates, names, and any relevant reference numbers.]

**Impact:**
[Describe how this has affected you.]
${
  !short
    ? `
**Previous attempts to resolve:**
[List any prior communications or steps taken.]

**Desired outcome:**
[State clearly what resolution you are seeking.]

I trust that this matter will be dealt with promptly and professionally. Please acknowledge receipt of this complaint and advise on the next steps.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I am writing to make a formal complaint about [issue].

Here is what happened: [Clear, factual account of the problem, with dates and relevant details.]

This has affected me in the following ways: [Impact.]
${
  !short
    ? `
I have already [describe any previous attempts to resolve this].

What I am asking for: [Specific resolution.]

I expect a response within [reasonable timeframe, e.g. 5 working days].`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function settingBoundaries(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "A note on [topic]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I wanted to take a moment to address [topic] in a constructive way.

[Describe the situation clearly and calmly, without accusation.]

Going forward, I would appreciate it if [state the boundary you are setting, clearly and specifically].
${
  !short
    ? `
I want to be clear that my intention is not to create conflict but to ensure that we can continue to work together effectively and with mutual respect.

I would welcome the opportunity to discuss this further if you feel that would be helpful.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I wanted to have an honest conversation about [topic], as it's something that's been on my mind.

[Describe what's been happening and why it's an issue for you.]

Going forward, what would work better for me is [specific boundary or changed behaviour].
${
  !short
    ? `
I'm not raising this to cause friction — I just think being direct now will make things easier for both of us.

[Offer to discuss in person if that would help.]

Thanks for understanding.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New Personal templates ──────────────────────────────────────────────

function sympathy(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Thinking of you";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal" || tg === "sensitive") {
    body = `${greet}

I was deeply saddened to hear about [the loss / the difficult situation you are going through]. Please know that my thoughts are with you and your family at this time.

[Say something genuine and specific about the person/situation, if appropriate.]
${
  !short
    ? `
There are no words that can truly ease this kind of pain, but I hope you find comfort in the knowledge that you are surrounded by people who care for you deeply.

Please do not hesitate to reach out if there is anything I can do — whether that is [practical help] or simply being there to listen.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I heard about what you're going through, and I just wanted to reach out and say I'm thinking of you.

[Something genuine and personal that shows you care.]
${
  !short
    ? `
I know there's nothing I can say to make things easier, but I'm here if you need anything at all — whether it's a chat, some company, or just someone to sit with.

Take care of yourself.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function birthdayWishes(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Happy birthday!";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to wish you a very happy birthday. I hope that your special day is filled with joy and the company of those closest to you.
${
  !short
    ? `
[Add a personal note or reflection on the past year if appropriate.]

Wishing you all the very best for the year ahead.`
    : ""
}

${sig}`;
  } else if (tg === "warm") {
    body = `${greet}

Happy birthday!! 🎉 Hope your day is absolutely wonderful and you're being properly spoiled.

[Add something personal and warm — a memory, a quality you admire, or a wish for the year ahead.]
${
  !short
    ? `
Here's to an incredible year ahead — you deserve all the great things coming your way!`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Happy birthday! Hope you're having the best day and treating yourself well.

[Add a personal touch — something you appreciate about them or a fun reference.]
${
  !short
    ? `
Wishing you a fantastic year ahead. You've got a lot of good things coming!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function reconnecting(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Long time no talk!";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

It's been a while since we last spoke, and I'm writing to reconnect.

[Mention what prompted you to get in touch — a memory, a recent development, or simply that they came to mind.]
${
  !short
    ? `
I would be delighted to hear how you have been and to catch up on what you have been doing. Would you be open to a brief call or coffee sometime?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I can't believe how much time has passed! I was [thinking of you / came across something that reminded me of you] and thought it was well past time to reach out.

How have you been? What's new in your world?
${
  !short
    ? `
[Share a quick update on yourself to make it feel mutual.]

Would love to catch up properly — up for a quick call or a coffee sometime soon?`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New HR & Hiring templates ────────────────────────────────────────────

function jobOffer(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Job offer — [role title]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am delighted to offer you the position of [role title] at [company name].

Please find the key details of this offer below:

- **Role:** [Job title]
- **Start date:** [Proposed start date]
- **Salary:** [Salary and currency]
- **Contract type:** [Permanent / Fixed-term / Contract]
- **Location:** [Office / Remote / Hybrid]
${
  !short
    ? `
A formal contract including all terms and conditions will be sent separately for your review and signature.

We are very much looking forward to welcoming you to the team. Please let us know whether you accept this offer by [deadline date].

Do not hesitate to reach out if you have any questions in the meantime.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

We'd love to offer you the role of [job title] at [company]!

Here are the key details:
- **Start date:** [Date]
- **Salary:** [Amount]
- **Location:** [Office / Remote / Hybrid]
${
  !short
    ? `
We'll send over a full contract shortly, but wanted to get this to you first.

We're really excited about you joining the team — hope you're as excited as we are! Please let us know by [date] whether you'd like to accept.

Any questions, don't hesitate to ask.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function rejectionCandidate(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Your application for [role]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Thank you for taking the time to apply for the [role] position at [company] and for participating in our selection process.

After careful consideration, we regret to inform you that we will not be progressing with your application at this time.
${
  !short
    ? `
This was a very competitive process and the decision was not an easy one. While your application was impressive in many respects, we have decided to proceed with a candidate whose experience more closely matches our current needs.

We would like to encourage you to apply for future roles at [company] that may be a strong fit. We wish you every success in your job search.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thank you so much for applying for [role] at [company] and for the time you put into the process.

After careful consideration, we've decided not to move forward with your application on this occasion.
${
  !short
    ? `
It was a genuinely tough decision — the quality of candidates was very high, and this wasn't a reflection of your abilities.

We'd encourage you to keep an eye on future openings at [company]. We really appreciated you considering us, and we wish you all the best with your search.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function interviewInvitation(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Interview invitation — [role]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am pleased to invite you to interview for the position of [role] at [company name].

**Interview details:**
- **Date:** [Date]
- **Time:** [Time and timezone]
- **Format:** [In-person / Video call — include location or link]
- **Duration:** [Approx. time]
- **Interviewer(s):** [Name(s) and title(s)]
${
  !short
    ? `
Please confirm your availability by [date]. If the proposed time is not convenient, please let us know your availability and we will do our best to accommodate you.

We look forward to meeting you.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Great news — we'd love to invite you to interview for [role] at [company]!

**When:** [Date and time]
**How:** [Video call link / In-person address]
**Who you'll meet:** [Names and roles]
${
  !short
    ? `
Please let us know if this time works for you, or suggest alternatives if needed. The interview should take about [duration].

Looking forward to chatting!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function referenceRequest(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Reference request — ${p.yourName || "[your name]"}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am currently [applying for a role / pursuing a new opportunity] and I would be very grateful if you'd be willing to serve as a professional reference.

[Explain the role or opportunity you're applying for and why you thought of them as a reference.]
${
  !short
    ? `
I have attached my CV for your reference. If contacted, you may be asked about [specific skills or experiences relevant to the role].

Of course, I completely understand if you are unable to do this. Please let me know either way at your earliest convenience, and thank you sincerely for considering it.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Hope you're doing well! I'm reaching out because I'm applying for [role/type of role] and wondered if you'd be willing to be a reference for me.

[Briefly mention why you thought of them and what the opportunity involves.]
${
  !short
    ? `
I would only expect to be contacted if I make it through to the final stages. I'll make sure to keep you in the loop.

Of course, I completely understand if now's not a great time. Let me know either way, and thank you so much for considering it!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function performanceReview(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Performance review — [name/period]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I would like to schedule your performance review for the [period, e.g. Q1 / annual] period.

**Proposed date:** [Date and time]
**Format:** [In person / Video call]
**Duration:** Approximately [duration]

In preparation, I would appreciate it if you could reflect on the following:
${
  !short
    ? `
- Your key achievements over the review period
- Areas where you feel you have grown
- Any challenges or support you would like to discuss
- Your goals for the next period

Please come prepared to discuss these areas openly. I look forward to a productive and constructive conversation.`
    : "- Key achievements and goals for the next period."
}

${sig}`;
  } else {
    body = `${greet}

Time for your [period] performance review! I'd like to schedule a chat to go over how things have been going.

**Suggested time:** [Date/time]
**Format:** [Video/in person]
${
  !short
    ? `
To make the most of our time, it'd be great if you could come with some thoughts on:
- What's gone well this [period]
- What you'd like to work on or change
- Your priorities going forward

Looking forward to a good conversation!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function onboardingWelcome(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Welcome to the team, ${p.recipientName || "[name]"}!`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

On behalf of the entire team at [company name], I am delighted to welcome you to your new role as [job title].

Your first day is confirmed for [start date]. Please find below some important information to help you prepare:

- **Arrival time:** [Time]
- **Location:** [Address or remote login instructions]
- **Who to ask for:** [Name and contact]
${
  !short
    ? `
During your first week, you will [brief overview of induction plans].

Should you have any questions before you start, please do not hesitate to contact me directly. We very much look forward to having you on board.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

We're so excited to have you joining us as [job title]! The whole team is looking forward to working with you.

Your start date is [date]. Here's what you need to know:
- **First day:** [Time, location or login details]
- **Who to contact:** [Name]
${
  !short
    ? `
Your first week will include [brief overview of plans — meetings, induction, etc.].

If you have any questions before then, don't hesitate to reach out. We can't wait to have you with us!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function contractRenewal(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Contract renewal — [name/role]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing regarding the renewal of your contract as [role], which is due to expire on [date].

We would be pleased to offer you a renewal of your contract on the following terms:

- **Duration:** [New contract period]
- **Rate/Salary:** [Updated terms, if applicable]
- **Other changes:** [Any amendments]
${
  !short
    ? `
Please review the attached documentation and let us know whether you wish to proceed. We would appreciate your response by [deadline].

If you have any questions or wish to discuss the terms further, please do not hesitate to contact me.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Your contract as [role] is coming up for renewal on [date], and we'd very much like to continue working with you.

Here's what we're proposing:
- **New period:** [Duration]
- **Terms:** [Any changes or "same as current"]
${
  !short
    ? `
We'll send over the formal paperwork shortly. In the meantime, do let us know if you have any questions or would like to discuss anything before signing.

Really glad to be continuing this working relationship!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function terminationNotice(p: EmailParams): GeneratedEmail {
  const short = p.length === "Short";
  const subject = "Notice of termination";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  const body = `${greet}

I am writing to formally notify you that your employment / engagement with [company name] will be terminated, effective [termination date].

[State the reason for termination briefly and factually, in accordance with your company policy and applicable law.]
${
  !short
    ? `
During your notice period, you will be expected to [describe expectations — handover, access restrictions, etc.].

Your final payment, including [accrued leave / outstanding amounts], will be processed by [date].

You will receive a formal letter outlining your rights and any applicable terms by [date].

If you have any questions, please contact [HR contact name] at [contact details].`
    : ""
}

${sig}`;
  return { subject, body: body.trim() };
}

// ─── New Customer Service templates ──────────────────────────────────────

function complaintResponse(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Re: Your complaint — [ref number]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Thank you for bringing this matter to our attention. I sincerely apologise for the experience you have had, and I want to assure you that we take all feedback of this nature very seriously.

Having reviewed your complaint regarding [issue], I can confirm the following: [explanation of what happened and steps taken to investigate].
${
  !short
    ? `
As a resolution, we would like to offer [proposed remedy — refund, replacement, account credit, etc.].

We are also taking the following steps to prevent a recurrence: [actions being taken].

I hope this goes some way towards restoring your confidence in us. If you have any further concerns, please do not hesitate to contact me directly.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thank you for getting in touch, and I'm genuinely sorry about the experience you had with [issue].

I've looked into this and here's what I can tell you: [explanation of what happened].
${
  !short
    ? `
To put this right, I'd like to [proposed remedy].

We're also making sure [step taken to prevent it happening again].

Please don't hesitate to reach out if there's anything else I can do to help — I want to make sure we get this right for you.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function refundApproval(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Your refund has been approved";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to confirm that your refund request has been approved.

The amount of [amount] will be credited to [original payment method / bank account] within [number] business days.
${
  !short
    ? `
Please note that the exact timing may vary depending on your bank or card provider.

If you have not received your refund within [timeframe], please do not hesitate to contact us with your reference number: [ref].

We appreciate your patience and apologise for any inconvenience caused.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Great news — your refund of [amount] has been approved!

You should see it back on [payment method] within [number] business days.
${
  !short
    ? `
If you don't see it after [timeframe], please get in touch with your reference number [ref] and we'll look into it straight away.

Thanks for your patience, and we're sorry for any trouble this caused.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function refundRejection(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Regarding your refund request";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Thank you for your refund request submitted on [date] for [item/service].

After careful review, I regret to inform you that we are unable to approve this refund request on this occasion. [Clear, factual reason — e.g. "This falls outside our 30-day returns window" / "The item shows signs of use beyond normal wear."]
${
  !short
    ? `
Our full returns and refunds policy can be found at [link].

If you feel this decision has been made in error, or if you have any additional information to support your request, please do not hesitate to contact us and we will be happy to review your case again.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Thank you for getting in touch about your refund for [item/service].

Unfortunately, after reviewing your request, we aren't able to process a refund in this case. [Brief, clear reason.]
${
  !short
    ? `
[Offer any alternative resolution if applicable — store credit, exchange, etc.]

I understand this isn't the outcome you were hoping for. If you'd like to discuss it further or believe there's something we've missed, please reply and I'll be happy to look into it again.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function serviceUpdate(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Important update regarding [service]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to inform you of an important update regarding [service name].

**What is changing:** [Clear description of the change.]
**When this takes effect:** [Date and time, including timezone.]
${
  !short
    ? `
**Why we are making this change:** [Brief explanation of the reason — improvement, compliance, infrastructure, etc.]

**What you need to do:** [Any action required from the customer, or "no action is required on your part."]

We apologise for any inconvenience this may cause. If you have any questions, please do not hesitate to contact our support team at [contact details].`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

We wanted to give you a heads up about an upcoming change to [service].

**What:** [Description of the change.]
**When:** [Date/time.]
${
  !short
    ? `
**Why:** [Short explanation.]
**What you need to do:** [Action required, or "nothing — we've got it covered."]

If you have any questions or concerns, just reply to this email and we'll be happy to help.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function accountIssue(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Issue with your account — [company]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to alert you to an issue we have identified with your account.

**Issue:** [Description of the problem.]
**Impact:** [How this affects their account or service.]

**Action required:** [What the customer needs to do to resolve it, or confirm that your team is handling it.]
${
  !short
    ? `
Please take action by [date] to avoid any disruption to your service.

If you have any questions or believe this has been flagged in error, please contact us at [support contact].

We apologise for any inconvenience and appreciate your prompt attention to this matter.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

We've spotted an issue with your account that we wanted to flag as soon as possible.

**What's happening:** [Brief description.]
**What it means for you:** [Impact.]
**What to do:** [Clear instructions, or "our team is already on it."]
${
  !short
    ? `
If you have any questions or don't think this applies to you, just reply to this message and we'll sort it out.

Thanks for bearing with us!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function customerOnboarding(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Getting started with ${p.context || "[product/service]"}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Welcome to [product/service]. We are delighted to have you on board.

To help you get started, we have prepared the following resources:

- [Step 1: e.g. "Log in at [URL]"]
- [Step 2: e.g. "Complete your profile"]
- [Step 3: e.g. "Explore the key features"]
${
  !short
    ? `
Should you require any assistance, our support team is available at [contact details] and our help centre can be found at [URL].

We look forward to supporting you and hope you find [product/service] of great value.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Welcome aboard — we're so excited to have you with us! 🎉

Here's how to get started with [product/service]:

1. [First step]
2. [Second step]
3. [Third step — e.g. "Explore the dashboard and try [key feature]"]
${
  !short
    ? `
If you ever get stuck or have questions, our support team is always here to help at [contact] or [help centre URL].

We're rooting for you — let us know how you get on!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function renewalReminder(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Your [product] subscription is coming up for renewal";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am writing to remind you that your subscription to [product/service] is due for renewal on [renewal date].

**Current plan:** [Plan name and key features]
**Renewal amount:** [Amount]
**Renewal date:** [Date]
${
  !short
    ? `
Unless you take action before this date, your subscription will automatically renew at the above amount.

If you wish to upgrade, downgrade, or cancel your subscription, please visit [URL] or contact us at [contact details].

Thank you for your continued subscription.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Just a friendly reminder that your [product/service] subscription renews on [date].

**Plan:** [Plan name]
**Amount:** [Renewal amount]
${
  !short
    ? `
Everything will renew automatically — no action needed if you're happy to continue.

If you'd like to make any changes or have questions about your plan, just reply to this email or visit [URL].

Thanks for being with us!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── New Networking templates ─────────────────────────────────────────────

function conferenceFollowUp(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Great meeting you at [conference]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

It was a pleasure to make your acquaintance at [conference name] on [date]. I greatly enjoyed our conversation about [topic], and I wanted to follow up as promised.

[Summarise the key points of your discussion or reaffirm your shared interest.]
${
  !short
    ? `
I believe there is real value in staying connected, and I would welcome the opportunity to continue our conversation at your convenience — whether by email, phone, or over coffee if our paths cross again.

I look forward to hearing from you.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

It was so great meeting you at [conference name]! I really enjoyed our chat about [topic] and wanted to follow up while it was still fresh.

[Reference something specific you discussed or found inspiring about them.]
${
  !short
    ? `
I'd love to stay in touch and maybe explore [potential collaboration / continued conversation / staying connected].

Would you be open to a quick call sometime in the next few weeks?`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function linkedinConnection(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Connecting on LinkedIn";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

Your work in [their field/role] stood out to me on LinkedIn — [specific thing that impressed you]. I'd like to connect.

[Explain specifically what prompted you to connect — shared industry, mutual connection, admiration for their work.]
${
  !short
    ? `
I believe there may be value in staying connected, and I hope you will consider accepting my invitation.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I came across your profile and loved what I saw — especially [something specific about their work or background].

[Explain briefly why you'd like to connect — shared interest, industry, or a specific reason.]
${
  !short
    ? `
Would be great to have you in my network. I'm always happy to help where I can too!`
    : "Hope to connect!"
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function mentorRequest(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = `Mentorship request — ${p.yourName || "[your name]"}`;
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

My name is ${p.yourName || "[your name]"}, and your work in [their field] has been a significant source of inspiration for me — particularly [specific achievement or decision].

I am currently [describe your situation — career stage, goals, challenges], and I have long aspired to [what you'd like to achieve]. Having observed the path you have taken, I believe your guidance would be invaluable.
${
  !short
    ? `
I want to be respectful of your time, and I am not asking for a significant commitment — even occasional conversations at intervals that suit you would be enormously helpful.

Would you be open to an exploratory call to see whether a mentoring relationship might work for us both?

Thank you sincerely for considering this.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I hope you don't mind me reaching out. I'm ${p.yourName || "[your name]"}, currently [your situation — job, field, career stage].

I've been following your work for a while now, and honestly your career path is exactly the kind of thing I'm working towards. [Mention something specific that inspired you.]
${
  !short
    ? `
I know how valuable your time is, so I want to be upfront: I'm not looking for a huge commitment. Even a 30-minute chat every couple of months would mean the world to me.

Would you be open to a quick introductory call to see if this might work?

Thank you so much for even considering it.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function recommendationRequest(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "LinkedIn recommendation request";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I hope you are well. I am currently [updating my LinkedIn profile / applying for new opportunities] and would be very grateful if you would consider writing a brief recommendation for me.

Given our work together on [project or context], I believe you would be well placed to speak to [specific skills or qualities].
${
  !short
    ? `
I understand this is a request on your time, and I want you to know I genuinely appreciate it. If it would be helpful, I am happy to send over some bullet points on what we worked on together.

Thank you very much for considering this.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

Hope you're doing great! I'm [refreshing my LinkedIn / looking for new opportunities] and was wondering if you'd be willing to write me a quick recommendation?

We worked together on [project/context], so I think you'd have a great perspective on [skills/qualities].
${
  !short
    ? `
Even a few sentences would make a big difference. I'm happy to return the favour or share some notes on what we did together if it helps.

No pressure at all — but if you're up for it, I'd really appreciate it!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function collaborationProposal(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Collaboration idea — [brief topic]";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I am reaching out with a collaboration idea that I believe could be mutually beneficial.

[Describe the collaboration concept clearly and concisely.]

**My thinking:** [Why this makes sense and what each party contributes.]
${
  !short
    ? `
**Proposed format:** [Type of collaboration — co-created content, joint event, product partnership, etc.]
**What I can offer:** [Your contribution.]
**What I'm hoping for from you:** [Their contribution.]

I would welcome the opportunity to discuss this idea further. Would you be open to a brief introductory call?`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I've been thinking about a collaboration idea and your name immediately came to mind!

[Pitch the idea simply and enthusiastically — what it is, why it excites you, and why you thought of them.]
${
  !short
    ? `
I think this could be great for both of us because [mutual benefit].

Would you be open to a quick chat to explore whether this could work? Even if it's not quite right, I'd love to hear your thoughts.`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

function alumniOutreach(p: EmailParams): GeneratedEmail {
  const tg = getToneGroup(p.tone);
  const short = p.length === "Short";
  const subject = "Fellow [school/org] alum reaching out";
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  let body: string;
  if (tg === "formal") {
    body = `${greet}

I hope you will forgive the out-of-the-blue message. My name is ${p.yourName || "[your name]"}, and I noticed from your profile that we are both alumni of [school/organisation].

I am currently [describe your situation] and wanted to reach out as I believe your experience in [their field/role] could be very relevant.
${
  !short
    ? `
[Explain specifically what you are hoping to discuss or learn from them.]

I would be very grateful for even 20 minutes of your time for a brief conversation. Thank you for considering this.`
    : ""
}

${sig}`;
  } else {
    body = `${greet}

I came across your profile and noticed we're both [school/org] alumni — had to reach out!

I'm ${p.yourName || "[your name]"}, currently [your situation]. [Brief reason for reaching out — advice, connection, curiosity about their career path.]
${
  !short
    ? `
I'd love to connect with fellow [school/org] people and would appreciate any chance to chat, even briefly.

Thanks so much for your time, and go [school/org]!`
    : ""
}

${sig}`;
  }
  return { subject, body: body.trim() };
}

// ─── Main export ───────────────────────────────────────────────────────────

// ─── NEW TEMPLATE GENERATORS ─────────────────────────────────────

function projectDelayUpdate(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  const short = p.length === "Short";
  const long = p.length === "Long";
  return {
    subject: "Update on Project Timeline",
    body: `${greet}

I'm writing to flag a delay affecting [project name] that you should be aware of.

${short ? "" : "The delay is due to [reason for delay]. We anticipate being back on track by [new expected date].\n\n"}${long ? "To minimise the impact, we are taking the following steps:\n\n- [Action 1]\n- [Action 2]\n- [Action 3]\n\nI appreciate your patience and understanding during this time. Please feel free to reach out if you have any questions or concerns.\n\n" : ""}I apologise for any inconvenience this may cause and will keep you updated as things progress.

${sig}`,
  };
}

function quoteFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Following Up on Your Quote",
    body: `${greet}

I wanted to follow up on the quote I sent over on [date]. I hope you've had a chance to review it.

${p.length === "Long" ? `If you have any questions about the pricing or scope, I'd be happy to walk you through it in more detail. I'm also open to discussing any adjustments that might make it a better fit for your needs.\n\n` : ""}Please let me know if you'd like to move forward, or if there's anything I can clarify.

${sig}`,
  };
}

function afterProposal(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Following Up on My Proposal",
    body: `${greet}

I'm following up on the proposal I shared on [date]. I hope you've had a chance to look it over.

${p.length !== "Short" ? `I believe [key benefit of proposal] could make a real difference for [their company/team]. I'm happy to answer any questions or adjust the scope if needed.\n\n` : ""}Could we schedule a quick call this week to discuss next steps?

${sig}`,
  };
}

function waitingOnDecision(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Checking In — Any Update?",
    body: `${greet}

I wanted to check in on [matter/proposal/project] and see if a decision has been reached on your end.

${p.length !== "Short" ? `I understand these things take time, and I'm happy to provide any additional information that might help move things forward.\n\n` : ""}Please let me know where things stand when you get a chance.

${sig}`,
  };
}

function postSaleCheckin(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Checking In — How Is Everything Going?",
    body: `${greet}

I wanted to check in and see how things are going since you started using [product/service].

${p.length !== "Short" ? `I hope the onboarding went smoothly and that you're finding value in [key feature]. If there's anything we can do to make the experience better, please don't hesitate to reach out.\n\n` : ""}Is there anything I can help with?

${sig}`,
  };
}

function paymentFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Following Up on Invoice #[Invoice Number]",
    body: `${greet}

I'm following up on invoice #[invoice number] for [amount], which was due on [due date].

${p.length !== "Short" ? `If you've already sent the payment, please disregard this message. If not, could you let me know when we might expect it?\n\n` : ""}Please don't hesitate to reach out if you have any questions about the invoice.

${sig}`,
  };
}

function budgetRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Budget Request — [Project/Initiative Name]",
    body: `${greet}

I am writing to request budget approval for [project/initiative name].

The estimated cost is [amount], which covers [brief breakdown of costs].

${p.length !== "Short" ? "This investment is expected to [key benefit]. I have attached a detailed breakdown for your review.\n\n" : ""}${p.length === "Long" ? "Specifically, the budget will be allocated as follows:\n\n- [Item 1]: [cost]\n- [Item 2]: [cost]\n- [Item 3]: [cost]\n\nI am confident this investment will deliver strong returns.\n\n" : ""}Please let me know if you have any questions or would like to discuss further.

${sig}`,
  };
}

function teamAnnouncement(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Team Announcement — [Topic]",
    body: `${greet}

I wanted to share an important update with the team: [announcement].

${p.length !== "Short" ? "This change will take effect on [date]. [Additional context or explanation.]\n\n" : ""}${p.length === "Long" ? "Here is what you need to know:\n\n- [Key point 1]\n- [Key point 2]\n- [Key point 3]\n\nPlease feel free to reach out if you have any questions.\n\n" : ""}Thank you for your continued support.

${sig}`,
  };
}

function deadlineExtensionRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Request for Deadline Extension — [Project/Task]",
    body: `${greet}

I am writing to request an extension for the deadline on [project/task], currently due on [original deadline].

Due to [reason], I would like to request an extension until [proposed new deadline].

${p.length !== "Short" ? "I want to ensure the work meets the expected standard and believe this additional time will allow me to deliver a higher quality outcome.\n\n" : ""}I apologise for any inconvenience and would appreciate your understanding.

${sig}`,
  };
}

function internalAnnouncement(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Important Update — [Subject]",
    body: `${greet}

I am pleased to share an important update with you: [announcement details].

${p.length !== "Short" ? "This is effective from [date]. [Explanation of what changes.]\n\n" : ""}${p.length === "Long" ? "Key highlights:\n\n- [Highlight 1]\n- [Highlight 2]\n- [Highlight 3]\n\nWe appreciate your ongoing commitment.\n\n" : ""}Please don't hesitate to reach out with any questions.

${sig}`,
  };
}

function scopeChangeNotice(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Scope Change Notice — [Project Name]",
    body: `${greet}

I am writing to inform you of a scope change on [project name].

The proposed change is: [description of change].

${p.length !== "Short" ? "This will impact the project timeline and/or budget as follows: [impact details]. I have prepared a revised proposal reflecting these changes.\n\n" : ""}Please review and let me know if you approve of the revised scope.

${sig}`,
  };
}

function clientBriefConfirmation(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Confirming Your Brief — [Project Name]",
    body: `${greet}

Thank you for sharing your brief for [project name]. I wanted to confirm my understanding before we proceed.

${p.length !== "Short" ? "Based on our conversation, I understand the key objectives to be:\n\n- [Objective 1]\n- [Objective 2]\n- [Objective 3]\n\n" : ""}The proposed timeline is [timeline] with a budget of [budget]. Please let me know if I have missed anything.

${sig}`,
  };
}

function riskEscalation(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Risk Escalation — [Project/Issue Name]",
    body: `${greet}

I am writing to escalate a risk that has been identified on [project/initiative]: [description of risk].

${p.length !== "Short" ? "The potential impact is [impact]. If not addressed, this could affect [timeline/budget/quality].\n\nProposed mitigation: [mitigation plan]\n\n" : ""}I would appreciate your guidance on how to proceed. Could we arrange a call at your earliest convenience?

${sig}`,
  };
}

function recruiterOutreach(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Exciting Opportunity at [Company Name]",
    body: `${greet}

I came across your profile and was impressed by your background in [field/skill]. I am reaching out about an exciting opportunity at [company name].

We are looking for a [role title] who can [key responsibility]. Based on your experience with [relevant experience], I believe you could be a great fit.

${p.length !== "Short" ? `The role offers [key benefits]. I'd love to tell you more about it.\n\n` : ""}Would you be open to a brief conversation to explore this further?

${sig}`,
  };
}

function podcastGuestPitch(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Guest Invitation — [Podcast Name]",
    body: `${greet}

I host [podcast name], a podcast about [topic] with [audience size/description]. I'd love to have you as a guest.

Your work on [specific topic/achievement] would resonate deeply with our audience. I think a conversation about [proposed topic] would be particularly valuable.

${p.length !== "Short" ? "Episodes typically run [length] and are published [frequency]. We have featured guests such as [notable past guest].\n\n" : ""}Would you be open to joining us?

${sig}`,
  };
}

function affiliatePartnership(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Affiliate Partnership Opportunity",
    body: `${greet}

I'm reaching out to explore a potential affiliate partnership between [your company] and [their company/brand].

${p.length !== "Short" ? "Our product [product name] is a great fit for your audience because [reason]. We offer [commission structure] and provide [marketing materials/support].\n\n" : ""}I believe this could be mutually beneficial. Would you be open to a quick call?

${sig}`,
  };
}

function productFeedbackRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Your Feedback on [Product Name]",
    body: `${greet}

I'm reaching out because we'd love to hear your thoughts on [product name]. As someone in the [industry/role], your perspective would be incredibly valuable.

${p.length !== "Short" ? `We're specifically interested in your feedback on [feature/aspect]. Any input — positive or constructive — would help us improve.\n\n` : ""}Would you be willing to spare [time] for a quick chat?

${sig}`,
  };
}

function addressingConflict(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "I'd Like to Talk — [Brief Topic]",
    body: `${greet}

I'd like to find a time to talk about [situation/conflict] — I think a direct conversation will help us move past this.

I want to be clear that my intention is to resolve this constructively. ${p.length !== "Short" ? "I value our relationship and believe an open conversation would help us move forward positively.\n\n" : ""}Would you be open to a conversation at a time that works for you?

${sig}`,
  };
}

function missedDeadlineApology(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Apology for Missing the Deadline",
    body: `${greet}

I want to sincerely apologise for missing the deadline on [task/project], which was due on [date].

${p.length !== "Short" ? "I take full responsibility for this. [Brief explanation if appropriate.] I understand this may have caused disruption, and I am sorry.\n\n" : ""}I have since [completed/resolved the issue] and will ensure this does not happen again. Thank you for your understanding.

${sig}`,
  };
}

function scopeCreepDiscussion(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Discussion on Project Scope — [Project Name]",
    body: `${greet}

I wanted to raise something I've noticed on [project name]. We've taken on tasks that fall outside the original scope, including [examples].

${p.length !== "Short" ? `I'm happy to accommodate these changes, but I think we should revisit our agreement to ensure alignment on timeline, deliverables, and budget.\n\n` : ""}Could we schedule a call to discuss this?

${sig}`,
  };
}

function breakingBadNews(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Important Update — [Topic]",
    body: `${greet}

I'm writing with some difficult news regarding [topic], and I want to be straightforward with you.

[Clearly state the news.]

${p.length !== "Short" ? "I understand this is not the outcome you were hoping for, and I am genuinely sorry. [Offer context if appropriate.]\n\nPlease know that [what you are doing to support them / next steps].\n\n" : ""}I am here if you'd like to talk through this further.

${sig}`,
  };
}

function condolences(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "My Deepest Condolences",
    body: `${greet}

I was deeply saddened to hear about the passing of [name]. Please accept my heartfelt condolences.

${p.length !== "Short" ? "[Name] was [a warm description]. [Optional: a brief personal memory.]\n\n" : ""}Please know that you are in my thoughts during this difficult time.

${sig}`,
  };
}

function weddingCongratulations(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Congratulations on Your Wedding!",
    body: `${greet}

Congratulations on your wedding! What wonderful news — I am so happy for you both.

${p.length !== "Short" ? "Wishing you a lifetime of happiness, laughter, and love together. [Optional: a personal note.]\n\n" : ""}I hope your special day was everything you dreamed of.

${sig}`,
  };
}

function newJobCongratulations(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Congratulations on Your New Role!",
    body: `${greet}

Congratulations on your new position at [company name]! You've worked hard for this and it's so well deserved.

${p.length !== "Short" ? "[Role title] is a fantastic opportunity and I have no doubt you will excel.\n\n" : ""}Wishing you all the best as you embark on this exciting new chapter.

${sig}`,
  };
}

function getWellSoon(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Thinking of You — Get Well Soon",
    body: `${greet}

I heard you haven't been well recently and wanted to reach out to let you know I'm thinking of you.

${p.length !== "Short" ? "Please take all the time you need to rest and recover — everything else can wait.\n\n" : ""}Wishing you a speedy recovery.

${sig}`,
  };
}

function salaryNegotiation(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Salary Discussion — [Your Name]",
    body: `${greet}

Thank you for the offer to join [company] as [role title]. I am genuinely excited about this opportunity.

After reviewing the offer, I would like to respectfully discuss the base salary. Based on my experience in [relevant area] and the market rate for this role, I was expecting something closer to [target salary].

${p.length !== "Short" ? "I am confident I can add significant value to the team and hope we can find a figure that reflects that. I am happy to discuss other elements of the package if helpful.\n\n" : ""}I look forward to reaching an agreement and am keen to move forward.

${sig}`,
  };
}

function promotionAnnouncement(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Promotion Announcement — [Employee Name]",
    body: `${greet}

I am delighted to announce that [employee name] has been promoted to [new title], effective [date].

${p.length !== "Short" ? "[Employee name] has made an outstanding contribution to [team/company] over the past [period], particularly in [key achievement]. This promotion reflects their hard work and dedication.\n\n" : ""}Please join me in congratulating [employee name] on this well-deserved achievement.

${sig}`,
  };
}

function leaveRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Leave Request — [Your Name]",
    body: `${greet}

I would like to formally request [type of leave] from [start date] to [end date], returning on [return date].

${p.length !== "Short" ? "[Brief reason if appropriate.]\n\nI will ensure all my responsibilities are covered before I leave and will brief [colleague name] on any ongoing tasks.\n\n" : ""}Please let me know if you need any further information.

${sig}`,
  };
}

function policyUpdate(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Policy Update — [Policy Name]",
    body: `${greet}

I am writing to inform you of an update to our [policy name], effective [date].

${p.length !== "Short" ? "The key changes are as follows:\n\n- [Change 1]\n- [Change 2]\n- [Change 3]\n\nThese changes have been made to [brief reason].\n\n" : "[Key change summary.]\n\n"}Please review the updated policy document attached.

${sig}`,
  };
}

function probationReview(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Probation Review — [Employee Name]",
    body: `${greet}

I am writing to confirm the outcome of your probation review, which took place on [date].

${p.length !== "Short" ? "Throughout your probation period, you have demonstrated [positive qualities]. [If applicable: There are also areas for further development: [areas].]\n\n" : ""}I am pleased to confirm that your employment will be [confirmed / extended until [date]].

${sig}`,
  };
}

function diversityOutreach(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Diversity & Inclusion — [Topic or Initiative]",
    body: `${greet}

I am reaching out in connection with our diversity and inclusion initiatives at [company name].

${p.length !== "Short" ? "We are committed to building an inclusive workplace. As part of this commitment, we are [launching/expanding] [initiative name].\n\nWe believe your expertise in [relevant area] would be a valuable contribution.\n\n" : "[Brief description of initiative and invitation.]\n\n"}Please let me know if you'd be open to connecting further.

${sig}`,
  };
}

function teamOffboarding(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Farewell — [Employee Name] Is Leaving",
    body: `${greet}

I wanted to let you know that [employee name] will be leaving [company name] on [last day].

${p.length !== "Short" ? "[Employee name] has been an integral part of our team and has contributed greatly to [team/project]. We will miss them and wish them all the best.\n\n" : ""}Please join me in thanking [employee name] for their contributions.

${sig}`,
  };
}

function serviceOutageNotice(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Service Disruption Notice — [Service Name]",
    body: `${greet}

We are writing to inform you that [service name] experienced a disruption on [date] between [start time] and [end time].

${p.length !== "Short" ? "The issue was caused by [brief explanation]. We have since resolved the problem and all services are now operating normally.\n\nWe are taking steps to prevent a recurrence, including [preventive measures].\n\n" : ""}If you experienced any lasting impact, please don't hesitate to contact us.

${sig}`,
  };
}

function featureAnnouncement(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "New Feature: [Feature Name]",
    body: `${greet}

We are excited to announce the launch of [feature name]!

${p.length !== "Short" ? `[Feature name] allows you to [key benefit]. Here's what's new:\n\n- [Benefit 1]\n- [Benefit 2]\n- [Benefit 3]\n\nTo get started, simply [call to action].\n\n` : "[Brief description of what's new.]\n\n"}We hope you enjoy it. As always, we'd love your feedback.

${sig}`,
  };
}

function churnPrevention(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "We'd Hate to See You Go",
    body: `${greet}

I noticed you haven't been using [product/service] recently and wanted to reach out personally.

${p.length !== "Short" ? `We value your business and want to make sure you're getting the most out of [product]. Is there anything we can do to improve your experience?\n\n` : ""}Would you be open to a quick call so I can better understand your needs?

${sig}`,
  };
}

function winBackCustomer(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "We've Missed You — Come Back and See What's New",
    body: `${greet}

It's been a while since we last heard from you, and we wanted to say — we've missed you!

${p.length !== "Short" ? `Since you were last with us, we've made some exciting improvements:\n\n- [Improvement 1]\n- [Improvement 2]\n- [Improvement 3]\n\nAs a welcome back, we'd like to offer you [special offer].\n\n` : "We'd love to have you back — and we have an exclusive offer just for you: [offer].\n\n"}Simply [call to action] to take advantage of this offer.

${sig}`,
  };
}

function escalationResponse(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Re: Your Escalation — [Topic]",
    body: `${greet}

Thank you for bringing this matter to our attention. I am sorry to hear about your experience with [issue], and I want to assure you this is being treated as a priority.

${p.length !== "Short" ? "I have personally reviewed your case and [describe action taken]. You can expect [specific outcome or timeline].\n\n" : ""}I am committed to resolving this to your satisfaction.

${sig}`,
  };
}

function boardIntroduction(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Introduction — [Your Name]",
    body: `${greet}

I am writing to introduce myself as I have recently joined the [board/committee] of [organisation].

${p.length !== "Short" ? "My background is in [field], with experience in [specific areas]. I look forward to contributing to this [board/committee], particularly in the area of [focus area].\n\n" : ""}I would welcome the opportunity to connect and learn more about the work ahead.

${sig}`,
  };
}

function speakingThankYou(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Thank You for Speaking at [Event Name]",
    body: `${greet}

I wanted to extend a sincere thank you for speaking at [event name]. Your talk on [topic] was truly one of the highlights of the event.

${p.length !== "Short" ? "The feedback from attendees has been overwhelmingly positive — people particularly valued [specific insight]. Your expertise made a real impact.\n\n" : ""}I hope we have the opportunity to collaborate again in the future.

${sig}`,
  };
}

function jobReferralIntro(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Introduction — [Candidate Name] for [Role]",
    body: `${greet}

I wanted to introduce you to [candidate name], who I believe would be an excellent fit for the [role] position at [company].

${p.length !== "Short" ? "[Candidate name] has a strong background in [relevant skills] and has achieved [key achievement]. I have had the pleasure of knowing them for [time period] and can speak highly of their work.\n\n" : ""}I am copying [candidate name] on this email so you can connect directly.

${sig}`,
  };
}

function eventInvitation(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "You're Invited — [Event Name]",
    body: `${greet}

I am delighted to invite you to [event name], taking place on [date] at [location/online].

${p.length !== "Short" ? "The event will bring together [audience description] for [purpose]. The agenda includes [key highlights].\n\nWe would be honoured to have you join us.\n\n" : ""}Please RSVP by [RSVP deadline] at [RSVP link/contact].

${sig}`,
  };
}

function coldSalesEmail(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "[One-line value proposition]",
    body: `${greet}

I'll get straight to the point — I think [your company/product] can help [their company] with [specific problem].

${p.length !== "Short" ? `We've helped companies like [similar company] achieve [specific result], and I believe we could do the same for you.\n\nHere's how it works: [brief, compelling explanation — 2-3 sentences].\n\n` : ""}Would you be open to a quick 15-minute call this week?

${sig}`,
  };
}

function objectionHandling(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Re: [Objection Topic]",
    body: `${greet}

Thank you for sharing your concerns — I completely understand where you're coming from.

${p.length !== "Short" ? `Regarding [specific objection]: [address the objection with evidence or reassurance]. Many of our customers had similar reservations before trying [product], and here's what they found: [customer insight].\n\n` : ""}I'm confident we can address this. Would it help to connect briefly and walk through it together?

${sig}`,
  };
}

function winBackProspect(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Checking In — Things Have Changed",
    body: `${greet}

A lot has changed at [your company/product] since we last spoke, and I think it's worth a fresh look.

${p.length !== "Short" ? `A lot has changed — we've [key improvement or new feature]. I believe this directly addresses [the concern you mentioned].\n\nWould it be worth a quick conversation?\n\n` : ""}Even a 15-minute call could be worthwhile.

${sig}`,
  };
}

function pricingInquiryResponse(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Pricing Information — [Product/Service]",
    body: `${greet}

Thank you for your interest in [product/service]. I'm happy to share pricing details.

${p.length !== "Short" ? "Our pricing is structured as follows:\n\n- [Plan 1]: [price] — [key features]\n- [Plan 2]: [price] — [key features]\n- [Plan 3]: [price] — [key features]\n\nMost companies of your size opt for [recommended plan].\n\n" : "[Pricing overview or starting price.]\n\n"}I'd be happy to prepare a tailored quote. Would a call work?

${sig}`,
  };
}

function upsellEmail(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Unlock More with [Upgrade/Feature Name]",
    body: `${greet}

Based on your usage of [product/service], there's a specific upgrade that I think would make a real difference for you.

${p.length !== "Short" ? `Based on your usage, I think you'd benefit greatly from [upgraded plan/add-on], which would allow you to [key benefit]. Many customers in your position have seen [specific result] after upgrading.\n\n` : ""}I'd love to walk you through what's included. Would you be open to a quick chat?

${sig}`,
  };
}

function renewalPitch(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Your [Product] Renewal — Let's Talk",
    body: `${greet}

Your [product/service] subscription renews on [renewal date] — I'm reaching out now so we have time to discuss terms before it lapses.

${p.length !== "Short" ? `Over the past [period], you've [brief summary of value delivered]. We've also launched [new features] that I think you'll find valuable going forward.\n\n` : ""}I'd love to connect to discuss renewal terms. Does a call this week work for you?

${sig}`,
  };
}

function lostDealFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Checking In — How Is [Alternative Solution] Working Out?",
    body: `${greet}

It's been [time period] since you went with a different solution — I'm checking in with no agenda, just to see how things have worked out.

${p.length !== "Short" ? `If things haven't quite worked out as expected, I'd love to reconnect. We've made significant improvements since we last spoke, including [key improvements].\n\n` : ""}No pressure — just wanted to keep the door open.

${sig}`,
  };
}

function referralRequestSales(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "A Quick Favour — Referral Request",
    body: `${greet}

I hope you're enjoying [product/service]. It's been great working with you.

${p.length !== "Short" ? "I wanted to ask — do you know anyone else who might benefit from [product/service]? A referral from you would mean a lot.\n\nEven a short introduction via email would be fantastic.\n\n" : ""}Thank you in advance!

${sig}`,
  };
}

function demoRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Quick Demo of [Product Name]?",
    body: `${greet}

I'd love to show you what [product name] can do for [their company/team] — specifically around [relevant use case].

${p.length !== "Short" ? `The demo takes about [X] minutes and I'll tailor it entirely to your situation. No fluff, just the parts relevant to you.\n\n` : ""}Are you available for a quick call this week?

${sig}`,
  };
}

function quarterlyBusinessReview(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Quarterly Business Review — [Q/Period]",
    body: `${greet}

I'd like to schedule our Quarterly Business Review for [Q/period] to review progress and plan ahead.

${p.length !== "Short" ? `I'd like to cover:\n\n- Results against goals from the previous quarter\n- Key wins and challenges\n- Priorities for the next quarter\n- Feedback from your team\n\nI'll prepare a summary deck ahead of time.\n\n` : ""}Could you share your availability for a [X]-hour session in [timeframe]?

${sig}`,
  };
}

function invoiceFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Invoice #[Invoice Number] — Friendly Reminder",
    body: `${greet}

I hope this finds you well. I wanted to send a friendly reminder about invoice #[invoice number] for [amount], which was due on [due date].

${p.length !== "Short" ? `If payment has already been processed, please disregard this — thank you! If not, I'd appreciate it if you could arrange payment at your earliest convenience.\n\nPayment can be made via [payment method/link].\n\n` : ""}Please let me know if you have any questions.

${sig}`,
  };
}

function paymentReminder(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Payment Reminder — [Amount] Due [Date]",
    body: `${greet}

This is a reminder that a payment of [amount] is due on [due date] for [description of services/goods].

${p.length !== "Short" ? "Please ensure payment is made by the due date to avoid any late fees. Payment can be submitted via [payment details].\n\n" : ""}Thank you for your prompt attention to this.

${sig}`,
  };
}

function contractRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Request for Contract — [Project/Service Name]",
    body: `${greet}

Following our recent discussions about [project/service], I would like to formalise our agreement with a contract.

${p.length !== "Short" ? `I have prepared a draft contract covering scope, timeline, payment, and responsibilities. Please let me know if you'd like to discuss any of the terms.\n\n` : ""}I look forward to formalising this arrangement.

${sig}`,
  };
}

function ndaIntro(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "NDA — [Project/Discussion Name]",
    body: `${greet}

Before we proceed with sharing further details about [project/discussion], I would like to propose that we put a Non-Disclosure Agreement (NDA) in place.

${p.length !== "Short" ? "This is standard practice for discussions of this nature and will help ensure both parties can share information openly and confidentially.\n\nI have attached a draft NDA for your review. Please feel free to propose any amendments.\n\n" : ""}I look forward to your response.

${sig}`,
  };
}

function latePaymentNotice(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Overdue Payment Notice — Invoice #[Invoice Number]",
    body: `${greet}

I am writing regarding invoice #[invoice number] for [amount], which was due on [due date] and remains unpaid.

${p.length !== "Short" ? "This is now [X days] overdue. I kindly ask that you arrange payment as soon as possible. If there is a reason for the delay, please let me know.\n\nPayment can be made via [payment method].\n\n" : ""}Please arrange payment at your earliest convenience.

${sig}`,
  };
}

function billingDispute(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Billing Dispute — Invoice #[Invoice Number]",
    body: `${greet}

I am writing to raise a query regarding invoice #[invoice number] dated [date] for [amount].

${p.length !== "Short" ? "I believe there may be an error in the invoice. Specifically, [describe the discrepancy].\n\nI have attached the relevant documentation. Could you please review and let me know how to resolve this?\n\n" : ""}I would appreciate a prompt response.

${sig}`,
  };
}

function purchaseOrderRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Purchase Order Request — [PO Description]",
    body: `${greet}

I would like to raise a purchase order for [description of goods/services] at a cost of [amount], from [supplier name].

${p.length !== "Short" ? "The purchase is required for [purpose/project]. Details:\n\n- Supplier: [supplier name]\n- Item(s): [description]\n- Cost: [amount]\n- Required by: [date]\n\nPlease find supporting documentation attached.\n\n" : ""}Kindly approve this purchase order at your earliest convenience.

${sig}`,
  };
}

function professorIntroduction(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Introduction — [Your Name], [Course Name]",
    body: `${greet}

My name is [your name] and I am a [year] student in [programme name]. I am enrolled in your [course name] course this [semester/term].

${p.length !== "Short" ? "I am particularly interested in [topic] and am looking forward to the course. If there is anything you recommend I review ahead of time, I would be grateful for any guidance.\n\n" : ""}I look forward to your class.

${sig}`,
  };
}

function extensionRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Extension Request — [Assignment Name]",
    body: `${greet}

I am writing to request an extension for [assignment name], currently due on [due date].

Due to [reason], I am finding it difficult to complete the work to a satisfactory standard by the deadline.

${p.length !== "Short" ? "I would like to request an extension until [proposed date]. I assure you this is not a regular occurrence and I take my academic responsibilities seriously.\n\n" : ""}I appreciate your understanding.

${sig}`,
  };
}

function recommendationLetterRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Request for Letter of Recommendation",
    body: `${greet}

I hope you are well. I am writing to ask if you would be willing to write a letter of recommendation on my behalf for [application/programme].

${p.length !== "Short" ? "I am applying to [specific programme/institution] and believe your perspective on my [academic ability/work] would be particularly valuable.\n\nThe deadline is [date] and should be submitted to [submission details]. I am happy to provide my CV, personal statement, or any other materials that might help.\n\n" : ""}I completely understand if you are unable to do this, and I am grateful for your consideration.

${sig}`,
  };
}

function researchInquiry(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Research Inquiry — [Topic]",
    body: `${greet}

I am writing to inquire about your research on [topic]. I am a [role/student] at [institution] and have been following your work with great interest, particularly [specific paper/project].

${p.length !== "Short" ? "I am currently working on [your research area] and would be very interested in [discussing your methodology / exploring potential collaboration].\n\nWould you be willing to spare [30 minutes] for a call?\n\n" : ""}I appreciate your time and look forward to hearing from you.

${sig}`,
  };
}

function scholarshipFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Following Up — Scholarship Application",
    body: `${greet}

I am writing to follow up on my scholarship application submitted on [date] for [scholarship name].

${p.length !== "Short" ? "I remain very interested in this opportunity and wanted to confirm my application was received. I am happy to provide any additional information to support it.\n\n" : ""}Could you please advise on the expected timeline for a decision?

${sig}`,
  };
}

function thesisFeedbackRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Thesis Feedback Request — [Chapter/Section]",
    body: `${greet}

I hope you are well. I have attached [chapter/draft] of my thesis, [thesis title], for your review.

${p.length !== "Short" ? "I would particularly appreciate your feedback on [specific area]. I am aiming to address [specific question] and would value your perspective.\n\nThere is no urgent deadline — whenever works for you.\n\n" : ""}Thank you in advance for your time and guidance.

${sig}`,
  };
}

function studyGroupInvitation(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Study Group Invitation — [Course Name]",
    body: `${greet}

I'm putting together a study group for [course name] and wanted to see if you'd like to join.

${p.length !== "Short" ? `We're planning to meet [frequency] to review lecture notes, work through problem sets, and prepare for exams.\n\n` : ""}Would you be interested? If so, let me know your availability.

${sig}`,
  };
}

function listingInquiry(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Inquiry Regarding [Property Address]",
    body: `${greet}

I am writing to express my interest in the property listed at [property address].

${p.length !== "Short" ? "I would like to learn more about [specific details, e.g. asking price, availability, lease terms]. I am a [buyer/renter] looking for [brief requirements] and this property appears to be a strong match.\n\nCould we arrange a viewing?\n\n" : ""}Please let me know the best way to proceed.

${sig}`,
  };
}

function offerSubmission(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Offer for [Property Address]",
    body: `${greet}

I am pleased to submit a formal offer for the property at [property address].

Offer price: [amount]
Proposed completion date: [date]
Conditions: [any conditions, or "none"]

${p.length !== "Short" ? "We are motivated buyers and are in a strong position to proceed quickly. Proof of funds/mortgage in principle is available upon request.\n\n" : ""}We look forward to your response.

${sig}`,
  };
}

function openHouseFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Following Up After the Open House — [Property Address]",
    body: `${greet}

Thank you for the opportunity to view [property address] at the open house on [date]. I was very impressed.

${p.length !== "Short" ? "I have a few follow-up questions:\n\n- [Question 1]\n- [Question 2]\n\nI am genuinely interested and would like to explore next steps.\n\n" : ""}Could we arrange a follow-up conversation?

${sig}`,
  };
}

function buyerFollowUp(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Checking In — Your Property Search",
    body: `${greet}

I wanted to check in and see how your property search is going. Have you had a chance to consider the properties I sent over?

${p.length !== "Short" ? `I've also identified a few new listings that I think could be a great fit:\n\n- [Property 1] — [brief description, price]\n- [Property 2] — [brief description, price]\n\nI'd be happy to arrange viewings at a time that suits you.\n\n` : ""}Please let me know how I can help narrow down the search.

${sig}`,
  };
}

function agentIntroduction(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Introduction — [Your Name], [Agency Name]",
    body: `${greet}

My name is [your name] and I am a property agent at [agency name], specialising in [area/type of property].

I came across your [property/details] and wanted to introduce myself. ${p.length !== "Short" ? "I have [X] years of experience in [local area/market] and a strong track record of [key achievement].\n\nI would love to learn more about your goals.\n\n" : ""}Would you be open to a brief conversation?

${sig}`,
  };
}

function priceReductionRequest(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Price Discussion — [Property Address]",
    body: `${greet}

Thank you for showing me [property address]. I am very interested in the property, but I want to be transparent about my situation.

${p.length !== "Short" ? "Based on [comparable sales / survey results / the current market], I would like to propose a revised offer of [amount]. I hope this can be considered in the spirit of reaching an agreement that works for both parties.\n\n" : ""}I am a motivated buyer and hope we can find common ground.

${sig}`,
  };
}

function tenantInquiry(p: EmailParams): GeneratedEmail {
  const greet = greeting(p.recipientName, p.tone);
  const sig = signature(p);
  return {
    subject: "Rental Inquiry — [Property Address]",
    body: `${greet}

I am writing to express my interest in renting the property at [property address].

${p.length !== "Short" ? "A bit about me: I am a [profession] looking for [type of accommodation] for [intended tenancy length]. I am [employed full-time / a student / etc.] and can provide references and proof of income upon request.\n\nCould you please let me know the availability, monthly rent, and viewing options?\n\n" : ""}I look forward to hearing from you.

${sig}`,
  };
}

const GENERATORS: Record<string, (p: EmailParams) => GeneratedEmail> = {
  "after-meeting": afterMeeting,
  "no-response-nudge": noResponseNudge,
  "after-applying": afterApplying,
  "after-interview": afterInterview,
  "after-event": afterEvent,
  "after-demo": afterDemo,
  "project-delay-update": projectDelayUpdate,
  "quote-follow-up": quoteFollowUp,
  "after-proposal": afterProposal,
  "waiting-on-decision": waitingOnDecision,
  "post-sale-checkin": postSaleCheckin,
  "payment-follow-up": paymentFollowUp,
  introduction,
  "request-feedback": requestFeedback,
  "project-update": projectUpdate,
  "meeting-request": meetingRequest,
  "status-report": statusReport,
  "proposal-summary": proposalSummary,
  escalation,
  handover,
  "budget-request": budgetRequest,
  "team-announcement": teamAnnouncement,
  "deadline-extension-request": deadlineExtensionRequest,
  "internal-announcement": internalAnnouncement,
  "scope-change-notice": scopeChangeNotice,
  "client-brief-confirmation": clientBriefConfirmation,
  "risk-escalation": riskEscalation,
  "partnership-pitch": partnershipPitch,
  "informational-interview": informationalInterview,
  "sales-intro": salesIntro,
  "investor-outreach": investorOutreach,
  "speaker-invitation": speakerInvitation,
  "media-pitch": mediaPitch,
  "recruiter-outreach": recruiterOutreach,
  "podcast-guest-pitch": podcastGuestPitch,
  "affiliate-partnership": affiliatePartnership,
  "product-feedback-request": productFeedbackRequest,
  apology,
  "declining-politely": decliningPolitely,
  "difficult-feedback": difficultFeedback,
  resignation,
  complaint,
  "setting-boundaries": settingBoundaries,
  "addressing-conflict": addressingConflict,
  "missed-deadline-apology": missedDeadlineApology,
  "scope-creep-discussion": scopeCreepDiscussion,
  "breaking-bad-news": breakingBadNews,
  "thank-you": thankYou,
  congratulations,
  "checking-in": checkingIn,
  sympathy,
  "birthday-wishes": birthdayWishes,
  reconnecting,
  condolences,
  "wedding-congratulations": weddingCongratulations,
  "new-job-congratulations": newJobCongratulations,
  "get-well-soon": getWellSoon,
  "job-offer": jobOffer,
  "rejection-candidate": rejectionCandidate,
  "interview-invitation": interviewInvitation,
  "reference-request": referenceRequest,
  "performance-review": performanceReview,
  "onboarding-welcome": onboardingWelcome,
  "contract-renewal": contractRenewal,
  "termination-notice": terminationNotice,
  "salary-negotiation": salaryNegotiation,
  "promotion-announcement": promotionAnnouncement,
  "leave-request": leaveRequest,
  "policy-update": policyUpdate,
  "probation-review": probationReview,
  "diversity-outreach": diversityOutreach,
  "team-offboarding": teamOffboarding,
  "complaint-response": complaintResponse,
  "refund-approval": refundApproval,
  "refund-rejection": refundRejection,
  "service-update": serviceUpdate,
  "account-issue": accountIssue,
  "customer-onboarding": customerOnboarding,
  "renewal-reminder": renewalReminder,
  "service-outage-notice": serviceOutageNotice,
  "feature-announcement": featureAnnouncement,
  "churn-prevention": churnPrevention,
  "win-back-customer": winBackCustomer,
  "escalation-response": escalationResponse,
  "conference-follow-up": conferenceFollowUp,
  "linkedin-connection": linkedinConnection,
  "mentor-request": mentorRequest,
  "recommendation-request": recommendationRequest,
  "collaboration-proposal": collaborationProposal,
  "alumni-outreach": alumniOutreach,
  "board-introduction": boardIntroduction,
  "speaking-thank-you": speakingThankYou,
  "job-referral-intro": jobReferralIntro,
  "event-invitation": eventInvitation,
  "cold-sales-email": coldSalesEmail,
  "objection-handling": objectionHandling,
  "win-back-prospect": winBackProspect,
  "pricing-inquiry-response": pricingInquiryResponse,
  "upsell-email": upsellEmail,
  "renewal-pitch": renewalPitch,
  "lost-deal-follow-up": lostDealFollowUp,
  "referral-request-sales": referralRequestSales,
  "demo-request": demoRequest,
  "quarterly-business-review": quarterlyBusinessReview,
  "invoice-follow-up": invoiceFollowUp,
  "payment-reminder": paymentReminder,
  "contract-request": contractRequest,
  "nda-intro": ndaIntro,
  "late-payment-notice": latePaymentNotice,
  "billing-dispute": billingDispute,
  "purchase-order-request": purchaseOrderRequest,
  "professor-introduction": professorIntroduction,
  "extension-request": extensionRequest,
  "recommendation-letter-request": recommendationLetterRequest,
  "research-inquiry": researchInquiry,
  "scholarship-follow-up": scholarshipFollowUp,
  "thesis-feedback-request": thesisFeedbackRequest,
  "study-group-invitation": studyGroupInvitation,
  "listing-inquiry": listingInquiry,
  "offer-submission": offerSubmission,
  "open-house-follow-up": openHouseFollowUp,
  "buyer-follow-up": buyerFollowUp,
  "agent-introduction": agentIntroduction,
  "price-reduction-request": priceReductionRequest,
  "tenant-inquiry": tenantInquiry,
};

export function generateEmail(params: EmailParams): GeneratedEmail {
  const generator = GENERATORS[params.templateId];
  if (!generator) {
    return {
      subject: "[Subject line]",
      body: `Hi ${params.recipientName || "[name]"},\n\n[Email body]\n\n${params.signOff || "Best regards"},\n${params.yourName || "[your name]"}`,
    };
  }
  return generator(params);
}
