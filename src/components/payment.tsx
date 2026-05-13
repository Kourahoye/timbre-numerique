import { useState } from "react";

type PaymentMethod = "orange_money" | "mtn" | "visa" | "paycard";



interface DjomyPaymentModalProps {
  amount: number;
  currency?: string;
  description?: string;
  reference?: string;
  onSuccess?: (transactionId: string) => void;
  onClose?: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "orange_money" as PaymentMethod,
    label: "Orange Money",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#FF6600" />
        <circle cx="14" cy="14" r="8" fill="#FFE5CC" />
        <circle cx="14" cy="14" r="4" fill="#FF6600" />
      </svg>
    ),
    color: "#FF6600",
    placeholder: "Ex: 6XX XXX XXX",
    inputLabel: "Numéro Orange Money",
    type: "tel",
  },
  {
    id: "mtn" as PaymentMethod,
    label: "MTN Mobile Money",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#FFCC00" />
        <text x="14" y="18.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1A1A">MTN</text>
      </svg>
    ),
    color: "#FFCC00",
    placeholder: "Ex: 6XX XXX XXX",
    inputLabel: "Numéro MTN MoMo",
    type: "tel",
  },
  {
    id: "visa" as PaymentMethod,
    label: "Visa / Mastercard",
    icon: (
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <rect width="28" height="20" rx="3" fill="#1A1F71" />
        <text x="14" y="14" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF" letterSpacing="1">VISA</text>
      </svg>
    ),
    color: "#1A1F71",
    placeholder: "XXXX XXXX XXXX XXXX",
    inputLabel: "Numéro de carte",
    type: "text",
  },
  {
    id: "paycard" as PaymentMethod,
    label: "PayCard",
    icon: (
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <rect width="28" height="20" rx="3" fill="#00A86B" />
        <text x="14" y="14" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF" letterSpacing="0.5">PAYCARD</text>
      </svg>
    ),
    color: "#00A86B",
    placeholder: "Numéro PayCard",
    inputLabel: "Numéro PayCard",
    type: "text",
  },
];

type Step = "method" | "details" | "otp" | "success";

export default function DjomyPaymentModal({
  amount,
  currency,
  description,
  reference,
  onSuccess,
  onClose,
}: DjomyPaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phoneOrCard, setPhoneOrCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
  const isCard = selectedMethod === "visa" || selectedMethod === "paycard";
  const isMobile = selectedMethod === "orange_money" || selectedMethod === "mtn";

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("fr-GN").format(n) + " " + currency;

  const handleOpen = () => {
    setOpen(true);
    setStep("method");
    setSelectedMethod(null);
    setPhoneOrCard("");
    setExpiry("");
    setCvv("");
    setCardHolder("");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const handleSelectMethod = (id: PaymentMethod) => {
    setSelectedMethod(id);
    setError("");
  };

  const handleMethodNext = () => {
    if (!selectedMethod) {
      setError("Veuillez sélectionner un mode de paiement.");
      return;
    }
    setError("");
    setStep("details");
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleDetailsNext = async () => {
    setError("");
    if (isCard) {
      if (phoneOrCard.replace(/\s/g, "").length < 16) {
        setError("Numéro de carte invalide.");
        return;
      }
      if (!expiry || expiry.length < 5) {
        setError("Date d'expiration invalide.");
        return;
      }
      if (!cvv || cvv.length < 3) {
        setError("CVV invalide.");
        return;
      }
      if (!cardHolder.trim()) {
        setError("Nom du titulaire requis.");
        return;
      }
    } else {
      if (phoneOrCard.replace(/\s/g, "").length < 8) {
        setError("Numéro de téléphone invalide.");
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("otp");
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleConfirm = async () => {
    if (otp.some((d) => !d)) {
      setError("Veuillez entrer le code OTP complet.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setStep("success");
    const txId = "DJ-" + Math.random().toString(36).substring(2, 12).toUpperCase();
    onSuccess?.(txId);
  };

  const accentColor = method?.color ?? "#0066CC";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        style={{
          background: "#0066CC",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: 0.3,
        }}
      >
        Payer {formatAmount(amount)}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,15,30,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 20,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              overflow: "hidden",
              animation: "djomySlideIn 0.25s ease",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #003D99 0%, #0066CC 100%)",
                padding: "20px 24px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div  className="flex items-center gap-10">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.15)" />
                  <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" letterSpacing="0.5">DJ</text>
                </svg>
                {/* <div>
                  <div  className="bg-white font-bold text-sm tracking-[0.3]">
                    Djomy Pay
                  </div>
                  <div className="bg-zinc-300 text-[11.5px]">
                    Paiement sécurisé
                  </div>
                </div> */}
              </div>
              <button
                onClick={handleClose}
                className="bg-zinc-500 border-none rouned-lg w-8 h-8 text-white text-lg flex cursor-pointer items-center justify-center leading-none"
              >
                ×
              </button>
            </div>

            {/* Amount banner */}
            {step !== "success" && (
              <div
                className="bg-[#F0F5FF] px-3 py-6 items-center justify-between border-b border-b-[#E8ECF0]"
              >
                <div>
                  <div className="text-[11.5px] text-black mb-0.5">
                    {description}
                  </div>
                  <div className="text-[11px] text-black">Réf: {reference}</div>
                </div>
                <div
                  className="text-xl font-extrabold text-[#003D99] tracking-[-0.5]"
                >
                  {formatAmount(amount)}
                </div>
              </div>
            )}

            {/* Progress stepper */}
            {step !== "success" && (
              <div
                className="flex items-center gap-0 pt-3.5 py-1"
              >
                {(["method", "details", "otp"] as Step[]).map((s, i) => {
                  const steps: Step[] = ["method", "details", "otp"];
                  const currentIdx = steps.indexOf(step);
                  const isActive = i === currentIdx;
                  const isDone = i < currentIdx;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: isDone ? "#0066CC" : isActive ? "#0066CC" : "#E8ECF0",
                          color: isDone || isActive ? "#fff" : "#9BA8C0",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        className="mx-4"
                      >
                        {isDone ? "✓" : i + 1}
                      </div>
                      {i < 2 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: isDone ? "#0066CC" : "#E8ECF0",
                            margin: "0 4px",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Body */}
            <div style={{ padding: "20px 24px 24px" }}>

              {/* STEP 1 – Choose method */}
              {step === "method" && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1A2035", marginBottom: 4 }}>
                    Mode de paiement
                  </div>
                  <div style={{ fontSize: 13, color: "#667085", marginBottom: 16 }}>
                    Choisissez comment vous souhaitez payer
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {PAYMENT_METHODS.map((m) => (
                      <div
                        key={m.id}
                        className={`djomy-method-card${selectedMethod === m.id ? " selected" : ""}`}
                        style={{
                          ["--djomy-accent" as string]: m.color,
                          ["--djomy-accent-bg" as string]: m.color + "12",
                        } as React.CSSProperties}
                        onClick={() => handleSelectMethod(m.id)}
                      >
                        <div style={{ flexShrink: 0 }}>{m.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2035" }}>
                            {m.label}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${selectedMethod === m.id ? m.color : "#CBD5E1"}`,
                            background: selectedMethod === m.id ? m.color : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {selectedMethod === m.id && (
                            <div
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div style={{ color: "#C00", fontSize: 13, marginTop: 12 }}>{error}</div>
                  )}

                  <button
                    className="djomy-btn-primary text-white bg-linear-[135deg] from-[#003D99] to-[#0066CC] mt-5"
                    // style={{
                    //   background: "linear-gradient(, #003D99, #0066CC)",
                    //   color: "#fff",
                    //   marginTop: 20,
                    // }}
                    onClick={handleMethodNext}
                  >
                    Continuer →
                  </button>
                </div>
              )}

              {/* STEP 2 – Payment details */}
              {step === "details" && method && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }} >
                    {method.icon}
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1A2035" }}>
                      {method.label}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#667085", marginBottom: 18 }}>
                    {isMobile
                      ? "Entrez votre numéro de téléphone"
                      : "Entrez les informations de votre carte"}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label
                        style={{ fontSize: 12.5, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}
                      >
                        {method.inputLabel}
                      </label>
                      <input
                        className="djomy-input"
                        type={method.type}
                        placeholder={method.placeholder}
                        value={phoneOrCard}
                        onChange={(e) => {
                          if (isCard) {
                            setPhoneOrCard(formatCardNumber(e.target.value));
                          } else {
                            setPhoneOrCard(e.target.value.replace(/\D/g, "").slice(0, 12));
                          }
                        }}
                      />
                    </div>

                    {isCard && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label
                              style={{ fontSize: 12.5, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}
                            >
                              Expiration
                            </label>
                            <input
                              className="djomy-input"
                              placeholder="MM/AA"
                              value={expiry}
                              maxLength={5}
                              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            />
                          </div>
                          <div>
                            <label
                              style={{ fontSize: 12.5, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}
                            >
                              CVV
                            </label>
                            <input
                              className="djomy-input"
                              placeholder="123"
                              value={cvv}
                              maxLength={4}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{ fontSize: 12.5, fontWeight: 600, color: "#344054", display: "block", marginBottom: 6 }}
                          >
                            Titulaire de la carte
                          </label>
                          <input
                            className="djomy-input"
                            placeholder="PRÉNOM NOM"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div style={{ color: "#C00", fontSize: 13, marginTop: 12 }}>{error}</div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button className="djomy-btn-back" onClick={() => setStep("method")}>
                      ← Retour
                    </button>
                    <button
                      className="djomy-btn-primary"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
                        color: accentColor === "#FFCC00" ? "#1A1A1A" : "#fff",
                        flex: 1,
                      }}
                      onClick={handleDetailsNext}
                      disabled={loading}
                    >
                      {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.4)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "djomySpin 0.8s linear infinite",
                            }}
                          />
                          Vérification…
                        </span>
                      ) : (
                        "Valider →"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 – OTP */}
              {step === "otp" && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1A2035", marginBottom: 4 }}>
                    Code de confirmation
                  </div>
                  <div style={{ fontSize: 13, color: "#667085", marginBottom: 4 }}>
                    {isMobile
                      ? `Un code OTP a été envoyé au ${phoneOrCard}`
                      : "Entrez le code 3D Secure envoyé par votre banque"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#0066CC",
                      marginBottom: 22,
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    Renvoyer le code
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        className="djomy-otp-input"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        inputMode="numeric"
                      />
                    ))}
                  </div>

                  <div
                    style={{
                      background: "#F0F5FF",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🔒</span>
                    <div style={{ fontSize: 12, color: "#4A6FA5", lineHeight: 1.4 }}>
                      Transaction sécurisée par Djomy. Vos données sont chiffrées et protégées.
                    </div>
                  </div>

                  {error && (
                    <div style={{ color: "#C00", fontSize: 13, marginBottom: 12 }}>{error}</div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="djomy-btn-back" onClick={() => setStep("details")}>
                      ← Retour
                    </button>
                    <button
                      className="djomy-btn-primary"
                      style={{
                        background: "linear-gradient(135deg, #0A7A3E, #0DBF5E)",
                        color: "#fff",
                        flex: 1,
                      }}
                      onClick={handleConfirm}
                      disabled={loading}
                    >
                      {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid rgba(255,255,255,0.4)",
                              borderTopColor: "#fff",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "djomySpin 0.8s linear infinite",
                            }}
                          />
                          Traitement en cours…
                        </span>
                      ) : (
                        `Payer ${formatAmount(amount)}`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 – Success */}
              {step === "success" && (
                <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#ECFDF5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="17" stroke="#0DBF5E" strokeWidth="2" />
                      <path
                        d="M10 18L15.5 23.5L26 13"
                        stroke="#0DBF5E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="60"
                        strokeDashoffset="0"
                        style={{ animation: "djomyCheck 0.4s ease forwards" }}
                      />
                    </svg>
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 700, color: "#1A2035", marginBottom: 6 }}>
                    Paiement réussi !
                  </div>
                  <div style={{ fontSize: 13, color: "#667085", marginBottom: 20, lineHeight: 1.5 }}>
                    Votre paiement de <strong>{formatAmount(amount)}</strong> a été traité avec succès.
                  </div>

                  <div
                    style={{
                      background: "#F9FAFB",
                      borderRadius: 12,
                      padding: "14px 18px",
                      marginBottom: 22,
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#667085" }}>Méthode</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A2035" }}>
                        {method?.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#667085" }}>Montant</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A2035" }}>
                        {formatAmount(amount)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "#667085" }}>Référence</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#0066CC", fontFamily: "monospace" }}>
                        {reference}
                      </span>
                    </div>
                  </div>

                  <button
                    className="djomy-btn-primary"
                    style={{ background: "linear-gradient(135deg, #003D99, #0066CC)", color: "#fff" }}
                    onClick={handleClose}
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== "success" && (
              <div
                style={{
                  borderTop: "1px solid #F0F2F5",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1C3.69 1 1 3.69 1 7s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6Zm0 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm.75-3.75h-1.5v-4h1.5v4Z"
                    fill="#9BA8C0"
                  />
                </svg>
                <span style={{ fontSize: 11.5, color: "#9BA8C0" }}>
                  Sécurisé par Djomy • Chiffrement SSL 256-bit
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}