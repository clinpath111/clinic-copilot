export type ConsentState = "granted" | "withdrawn" | "none";

export type PatientRow = {
  id: string;
  fullName: string;
  sex: string | null;
  birthYear: number;
  language: "en" | "hi";
  phone: string;
  consent: ConsentState;
};

export type PhoneCheck =
  | { status: "empty" }
  | { status: "invalid" }
  | {
      status: "ok";
      display: string;
      existing: { id: string; fullName: string; birthYear: number }[];
      consent: ConsentState;
      consentDate: string | null;
    };
