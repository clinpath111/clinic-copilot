// All screen text lives here, in English and Hindi. Never hard-code text in a screen.
// The Hindi strings are DRAFTS: needs native-speaker review before the pilot.

const en = {
  "app.name": "Clinic Copilot",
  "skip": "Skip to main content",
  "lang.label": "Language",

  "nav.main": "Main navigation",
  "nav.home": "Home",
  "nav.team": "Team",
  "nav.activity": "Activity",
  "nav.settings": "Settings",

  "role.doctor": "Doctor",
  "role.receptionist": "Receptionist",
  "role.owner": "Owner",

  "status.done": "Done",
  "status.todo": "To do",

  "account.signOut": "Sign out",
  "account.title": "Your account",

  "home.greeting.morning": "Good morning, {name}",
  "home.greeting.afternoon": "Good afternoon, {name}",
  "home.greeting.evening": "Good evening, {name}",
  "home.subtitle": "Here is what is happening at {clinic}.",
  "home.denied": "You do not have permission to open that page.",

  "setup.title": "Finish setting up",
  "setup.subtitle": "These details are printed on every prescription you issue.",
  "setup.progress": "{done} of {total} done",
  "setup.item.qualifications": "Qualifications",
  "setup.item.registration": "Registration number",
  "setup.item.council": "Registration council",
  "setup.item.signature": "Signature",
  "setup.cta": "Complete my profile",
  "setup.done.title": "Your profile is complete",
  "setup.done.body": "You will be ready to issue prescriptions as soon as Quick Rx is available.",

  "reception.title": "Welcome to {clinic}",
  "reception.body": "Patient registration and the daily queue will appear here in the next update.",

  "soon.title": "Coming next",
  "soon.body": "Patient registration, the daily queue and Quick Rx prescriptions are being built. They will appear here.",

  "login.hero": "Write prescriptions in seconds. Never lose a follow-up.",
  "login.heroSub": "Built for busy clinics in India. Simple enough for the whole team.",
  "login.trust": "Only your clinic's team can see your clinic's information.",
  "login.title": "Welcome back",
  "login.subtitle": "Sign in to your clinic",
  "login.email.label": "Email address",
  "login.email.hint": "We will send a sign-in code to this email.",
  "login.sendCode": "Send me a code",
  "login.sending": "Sending...",
  "login.code.sent": "We sent a code to {email}.",
  "login.code.label": "Sign-in code",
  "login.verify": "Sign in",
  "login.verifying": "Checking...",
  "login.useOther": "Use a different email",
  "login.error.send": "We could not send the code. Check the email address and try again.",
  "login.error.rate": "Too many tries. Please wait a few minutes and try again.",
  "login.error.code": "That code did not work. Check it, or go back and ask for a new one.",
};

export type MessageKey = keyof typeof en;

// TypeScript refuses to compile if any English key is missing in Hindi.
const hi: Record<MessageKey, string> = {
  "app.name": "Clinic Copilot",
  "skip": "मुख्य सामग्री पर जाएँ",
  "lang.label": "भाषा",

  "nav.main": "मुख्य नेविगेशन",
  "nav.home": "होम",
  "nav.team": "टीम",
  "nav.activity": "गतिविधि",
  "nav.settings": "सेटिंग्स",

  "role.doctor": "डॉक्टर",
  "role.receptionist": "रिसेप्शनिस्ट",
  "role.owner": "मालिक",

  "status.done": "पूरा",
  "status.todo": "बाकी",

  "account.signOut": "साइन आउट",
  "account.title": "आपका खाता",

  "home.greeting.morning": "सुप्रभात, {name}",
  "home.greeting.afternoon": "नमस्कार, {name}",
  "home.greeting.evening": "शुभ संध्या, {name}",
  "home.subtitle": "{clinic} में आज की स्थिति यहाँ देखें।",
  "home.denied": "आपको वह पेज खोलने की अनुमति नहीं है।",

  "setup.title": "सेटअप पूरा करें",
  "setup.subtitle": "आपके जारी किए हर प्रिस्क्रिप्शन पर यह जानकारी छपती है।",
  "setup.progress": "{total} में से {done} पूरे",
  "setup.item.qualifications": "योग्यताएँ",
  "setup.item.registration": "पंजीकरण संख्या",
  "setup.item.council": "पंजीकरण परिषद",
  "setup.item.signature": "हस्ताक्षर",
  "setup.cta": "मेरी प्रोफ़ाइल पूरी करें",
  "setup.done.title": "आपकी प्रोफ़ाइल पूरी है",
  "setup.done.body": "Quick Rx उपलब्ध होते ही आप प्रिस्क्रिप्शन जारी करने के लिए तैयार होंगे।",

  "reception.title": "{clinic} में आपका स्वागत है",
  "reception.body": "मरीज़ पंजीकरण और रोज़ की कतार अगले अपडेट में यहाँ दिखाई देगी।",

  "soon.title": "जल्द आ रहा है",
  "soon.body": "मरीज़ पंजीकरण, रोज़ की कतार और Quick Rx प्रिस्क्रिप्शन बनाए जा रहे हैं। वे यहाँ दिखाई देंगे।",

  "login.hero": "कुछ ही सेकंड में प्रिस्क्रिप्शन लिखें। कोई फ़ॉलो-अप न छूटे।",
  "login.heroSub": "भारत के व्यस्त क्लिनिकों के लिए बना। पूरी टीम के लिए आसान।",
  "login.trust": "आपके क्लिनिक की जानकारी सिर्फ़ आपके क्लिनिक की टीम देख सकती है।",
  "login.title": "फिर से स्वागत है",
  "login.subtitle": "अपने क्लिनिक में साइन इन करें",
  "login.email.label": "ईमेल पता",
  "login.email.hint": "हम इस ईमेल पर साइन-इन कोड भेजेंगे।",
  "login.sendCode": "मुझे कोड भेजें",
  "login.sending": "भेजा जा रहा है...",
  "login.code.sent": "हमने {email} पर कोड भेजा है।",
  "login.code.label": "साइन-इन कोड",
  "login.verify": "साइन इन करें",
  "login.verifying": "जाँच हो रही है...",
  "login.useOther": "दूसरा ईमेल इस्तेमाल करें",
  "login.error.send": "हम कोड नहीं भेज सके। ईमेल पता जाँचकर फिर कोशिश करें।",
  "login.error.rate": "बहुत ज़्यादा कोशिशें हो गईं। कृपया कुछ मिनट रुककर फिर कोशिश करें।",
  "login.error.code": "यह कोड काम नहीं किया। इसे जाँचें, या वापस जाकर नया कोड माँगें।",
};

export type Locale = "en" | "hi";

export const messages: Record<Locale, Record<MessageKey, string>> = { en, hi };

export function format(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_match, name: string) => String(vars[name] ?? `{${name}}`));
}
