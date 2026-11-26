export type ConsentState = "granted" | "withdrawn" | "none";

export type PatientRow = {
  id: string;
  fullName: string;
  sex: string | null;
  birthYear: number;
  language: "en" | "hi";
  phone: string;
  landline: boolean;
  consent: ConsentState;
};

export type SimilarPatient = {
  id: string;
  fullName: string;
  birthYear: number;
  phone: string;
};

export type PhoneCheck =
  | { status: "empty" }
  | { status: "invalid" }
  | {
      status: "ok";
      display: string;
      landline: boolean;
      existing: { id: string; fullName: string; birthYear: number }[];
      consent: ConsentState;
      consentDate: string | null;
    };
