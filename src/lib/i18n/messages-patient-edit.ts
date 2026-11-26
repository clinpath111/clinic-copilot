// Text for editing patients and the extra safety notices.
// Hindi is a DRAFT: needs native-speaker review.
// The guardian consent wording is a DRAFT: needs lawyer review before real patients are asked.

export const enPatientEdit = {
  "detail.edit": "Edit details",
  "detail.consent.landline": "This is a landline. WhatsApp messages cannot be sent to it.",
  "detail.consent.recordMinor": "The parent or guardian agrees to WhatsApp messages",
  "activity.field.birthYear": "Birth year",
  "activity.field.sex": "Sex",
  "activity.field.language": "Message language",

  "edit.title": "Edit patient",
  "edit.subtitle": "Change the details here. The phone number is changed separately below.",
  "edit.back": "Back to patient",
  "edit.save": "Save changes",
  "edit.phone.title": "Phone number",
  "edit.phone.current": "Current number: {phone}",
  "edit.phone.warning": "WhatsApp agreement belongs to a phone number. If you change the number, the new number needs the patient's agreement again.",
  "edit.phone.new": "New mobile number",
  "edit.phone.save": "Change phone number",
  "edit.phone.saving": "Changing...",

  "register.phone.landline": "This looks like a landline. WhatsApp messages cannot reach it, so WhatsApp agreement is not asked.",
  "register.similar.title": "A similar patient is already registered",
  "register.similar.body": "If this is the same person with a new number, open their record and use Edit details to change the phone number. Otherwise, you can continue.",
  "register.consent.minorNote": "The patient may be under 18, so a parent or guardian must agree.",
  "register.consent.textMinor": "I am the patient's parent or legal guardian. I agree that this clinic may send the patient's prescription link, appointment reminders and follow-up reminders to this phone on WhatsApp. Messages will not show a diagnosis or medicines; they contain a private link. I can ask to stop at any time.",
  "register.consent.checkMinor": "The parent or guardian agrees to WhatsApp messages",
};

export const hiPatientEdit: Record<keyof typeof enPatientEdit, string> = {
  "detail.edit": "जानकारी बदलें",
  "detail.consent.landline": "यह लैंडलाइन है। इस पर WhatsApp संदेश नहीं भेजे जा सकते।",
  "detail.consent.recordMinor": "माता-पिता या अभिभावक WhatsApp संदेशों के लिए सहमत हैं",
  "activity.field.birthYear": "जन्म का साल",
  "activity.field.sex": "लिंग",
  "activity.field.language": "संदेशों की भाषा",

  "edit.title": "मरीज़ की जानकारी बदलें",
  "edit.subtitle": "जानकारी यहाँ बदलें। फ़ोन नंबर नीचे अलग से बदला जाता है।",
  "edit.back": "मरीज़ पर वापस",
  "edit.save": "बदलाव सहेजें",
  "edit.phone.title": "फ़ोन नंबर",
  "edit.phone.current": "मौजूदा नंबर: {phone}",
  "edit.phone.warning": "WhatsApp की सहमति फ़ोन नंबर से जुड़ी होती है। नंबर बदलने पर नए नंबर के लिए मरीज़ की सहमति फिर से लेनी होगी।",
  "edit.phone.new": "नया मोबाइल नंबर",
  "edit.phone.save": "फ़ोन नंबर बदलें",
  "edit.phone.saving": "बदला जा रहा है...",

  "register.phone.landline": "यह लैंडलाइन लगता है। WhatsApp संदेश इस पर नहीं पहुँच सकते, इसलिए WhatsApp की सहमति नहीं माँगी जाएगी।",
  "register.similar.title": "मिलता-जुलता मरीज़ पहले से पंजीकृत है",
  "register.similar.body": "अगर यह वही व्यक्ति है और नंबर नया है, तो उनका रिकॉर्ड खोलकर \"जानकारी बदलें\" से फ़ोन नंबर बदलें। वरना आगे बढ़ सकते हैं।",
  "register.consent.minorNote": "मरीज़ की उम्र 18 से कम हो सकती है, इसलिए माता-पिता या अभिभावक की सहमति ज़रूरी है।",
  "register.consent.textMinor": "मैं मरीज़ का माता-पिता या क़ानूनी अभिभावक हूँ। मैं सहमत हूँ कि यह क्लिनिक इस फ़ोन पर WhatsApp के ज़रिए मरीज़ का प्रिस्क्रिप्शन लिंक, अपॉइंटमेंट रिमाइंडर और फ़ॉलो-अप रिमाइंडर भेज सकता है। संदेशों में बीमारी या दवाइयों की जानकारी नहीं होगी; उनमें एक निजी लिंक होगा। मैं कभी भी इन्हें रोकने के लिए कह सकता/सकती हूँ।",
  "register.consent.checkMinor": "माता-पिता या अभिभावक WhatsApp संदेशों के लिए सहमत हैं",
};
