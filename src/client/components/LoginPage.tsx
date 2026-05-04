import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Sparkle, ArrowRight, Check } from "./icons";

export default function LoginPage() {
  const { connect } = useAuth();

  return (
    <div className="auth">
      <div className="auth__bg" aria-hidden="true">
        <div className="auth__bg-x">X</div>
      </div>

      <div className="auth__card">
        <div className="auth__brand">
          <span className="x">X</span>
          <span>adaptive<span style={{ color: "var(--ax-golden)" }}>X</span> Books</span>
        </div>

        <span className="eyebrow">Get started</span>
        <h1 className="auth__title">Connect to QuickBooks.</h1>
        <p className="auth__sub">
          Sign in with your QuickBooks Online account to start creating bulk invoices. Your data stays between you and Intuit.
        </p>

        <button
          className="btn btn--primary"
          style={{ width: "100%", padding: "14px 18px", fontSize: 15, marginTop: 8 }}
          onClick={connect}
        >
          <Sparkle size={16} /> Connect to QuickBooks <ArrowRight size={16} />
        </button>

        <div className="auth__rememberlist" style={{ marginTop: 24 }}>
          <div className="auth__remitem"><Check size={14} style={{ color: "#2A7B3F" }} /> Secure OAuth 2.0 — we never see your password</div>
          <div className="auth__remitem"><Check size={14} style={{ color: "#2A7B3F" }} /> Invoices created as drafts in QuickBooks</div>
          <div className="auth__remitem"><Check size={14} style={{ color: "#2A7B3F" }} /> Disconnect any time from your Intuit account</div>
        </div>

        <p className="auth__legal">
          By connecting you agree to the <a href="#">Terms</a> and <a href="#">Privacy Notice</a>.
        </p>
      </div>

      <div className="auth__foot">
        <span>&copy; 2026 adaptiveX</span>
        <span className="auth__foot-sep">&middot;</span>
        <a href="#">Help</a>
        <span className="auth__foot-sep">&middot;</span>
        <a href="#">Status</a>
      </div>
    </div>
  );
}
