"use client";

import { useRef, useState } from "react";
import type { PhoneCheck } from "@/lib/patient-types";
import { checkPhone } from "./actions";

// Checks a phone number while it is typed: valid? landline? who is already on it?
export function usePhoneCheck() {
  const [phone, setPhone] = useState("");
  const [check, setCheck] = useState<PhoneCheck>({ status: "empty" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(0);

  function onChange(value: string) {
    setPhone(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.replace(/\D/g, "").length < 10) {
      setCheck({ status: "empty" });
      return;
    }
    timer.current = setTimeout(async () => {
      const ticket = ++latest.current;
      const result = await checkPhone(value);
      if (ticket === latest.current) setCheck(result);
    }, 300);
  }

  function onBlur() {
    const digits = phone.replace(/\D/g, "").length;
    if (digits > 0 && digits < 10) setCheck({ status: "invalid" });
  }

  return { phone, check, onChange, onBlur };
}
