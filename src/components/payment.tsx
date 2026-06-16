import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useTranslation } from "react-i18next";

const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($phone: String!, $amount: Int!, $type: Int!) {
    initiatePayment(phone: $phone, amount: $amount, type: $type) {
      paymentUrl
      reference
    }
  }
`;

type PaymentMethod = "orange_money" | "mtn" | "visa" | "paycard";

interface DjomyPaymentModalProps {
  amount: number;
  type: number;
  currency?: string;
  description?: string;
  typeTimbre?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (transactionId: string) => void;
  onClose?: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "orange_money" as PaymentMethod,
    labelKey: "payment.methods.orangeMoney",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#FF6600" />
        <circle cx="14" cy="14" r="8" fill="#FFE5CC" />
        <circle cx="14" cy="14" r="4" fill="#FF6600" />
      </svg>
    ),
    color: "#FF6600",
    placeholderKey: "payment.methods.orangePlaceholder",
    inputLabelKey: "payment.methods.orangeLabel",
    type: "tel",
  },
  {
    id: "mtn" as PaymentMethod,
    labelKey: "payment.methods.mtnMoney",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="#FFCC00" />
        <text
          x="14"
          y="18.5"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#1A1A1A"
        >
          MTN
        </text>
      </svg>
    ),
    color: "#FFCC00",
    placeholderKey: "payment.methods.mtnPlaceholder",
    inputLabelKey: "payment.methods.mtnLabel",
    type: "tel",
  },
  {
    id: "visa" as PaymentMethod,
    labelKey: "payment.methods.visaMastercard",
    icon: (
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <rect width="28" height="20" rx="3" fill="#1A1F71" />
        <text
          x="14"
          y="14"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="#FFFFFF"
          letterSpacing="1"
        >
          VISA
        </text>
      </svg>
    ),
    color: "#1A1F71",
    placeholderKey: "payment.methods.cardPlaceholder",
    inputLabelKey: "payment.methods.cardLabel",
    type: "text",
  },
  {
    id: "paycard" as PaymentMethod,
    labelKey: "payment.methods.paycard",
    icon: (
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
        <rect width="28" height="20" rx="3" fill="#00A86B" />
        <text
          x="14"
          y="14"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fill="#FFFFFF"
          letterSpacing="0.5"
        >
          PAYCARD
        </text>
      </svg>
    ),
    color: "#00A86B",
    placeholderKey: "payment.methods.paycardPlaceholder",
    inputLabelKey: "payment.methods.paycardLabel",
    type: "text",
  },
];

type Step = "method" | "details" | "otp" | "success" | "error";

export default function DjomyPaymentModal({
  amount,
  type,
  currency = "GNF",
  description,
  typeTimbre,
  onSuccess,
  onClose,
  onError,
}: DjomyPaymentModalProps) {
  const { t } = useTranslation();
  const [initiatePayment, { loading: chargement }] =
    useMutation(INITIATE_PAYMENT);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [phoneOrCard, setPhoneOrCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lien, setLien] = useState("");

  const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
  const isCard = selectedMethod === "visa" || selectedMethod === "paycard";
  const isMobile =
    selectedMethod === "orange_money" || selectedMethod === "mtn";

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
      setError(t("payment.errors.selectMethod"));
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
        setError(t("payment.errors.invalidCardNumber"));
        return;
      }
      if (!expiry || expiry.length < 5) {
        setError(t("payment.errors.invalidExpiry"));
        return;
      }
      if (!cvv || cvv.length < 3) {
        setError(t("payment.errors.invalidCvv"));
        return;
      }
      if (!cardHolder.trim()) {
        setError(t("payment.errors.cardHolderRequired"));
        return;
      }
    } else {
      if (phoneOrCard.replace(/\s/g, "").length < 8) {
        setError(t("payment.errors.invalidPhone"));
        return;
      }
    }
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
      setError(t("payment.errors.invalidOtp"));
      return;
    }
    setError("");
    setLoading(true);

    initiatePayment({
      variables: {
        phone: phoneOrCard,
        amount: amount,
        type: type,
      },
    })
      .then((res) => {
        const txId =
          "DJ-" + Math.random().toString(36).substring(2, 12).toUpperCase();
        onSuccess?.(txId);
        setStep("success");
        setLien(res.data.initiatePayment.paymentUrl);
        return;
      })
      .catch((error) => {
        setStep("error");
        const txId =
          "DJ-" + Math.random().toString(36).substring(2, 12).toUpperCase();
        onError?.(txId);
        setError(error.message || t("payment.errors.paymentError"));
        return;
      });
    setLoading(false);
    return;
  };

  const accentColor = method?.color ?? "#0066CC";

  return (
    <>
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
        {t("payment.pay")} {formatAmount(amount)}
      </button>

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
            <style>{`
              @keyframes djomySlideIn {
                from { transform: translateY(24px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes djomySpin {
                to { transform: rotate(360deg); }
              }
              @keyframes djomyCheck {
                from { stroke-dashoffset: 60; }
                to { stroke-dashoffset: 0; }
              }
              .djomy-method-card {
                border: 1.5px solid #E8ECF0;
                border-radius: 12px;
                padding: 12px 14px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
                background: #fff;
              }
              .djomy-method-card:hover {
                background: #F6F8FB;
              }
              .djomy-method-card.selected {
                border-color: var(--djomy-accent);
                background: var(--djomy-accent-bg);
              }
              .djomy-input {
                width: 100%;
                border: 1.5px solid #E0E5EE;
                border-radius: 10px;
                padding: 11px 14px;
                font-size: 15px;
                outline: none;
                transition: border-color 0.15s;
                background: #FAFBFD;
                box-sizing: border-box;
                color: #1A2035;
              }
              .djomy-input:focus {
                border-color: #0066CC;
                background: #fff;
              }
              .djomy-otp-input {
                width: 44px;
                height: 52px;
                border: 1.5px solid #E0E5EE;
                border-radius: 10px;
                text-align: center;
                font-size: 20px;
                font-weight: 600;
                outline: none;
                transition: border-color 0.15s;
                background: #FAFBFD;
                color: #1A2035;
              }
              .djomy-otp-input:focus {
                border-color: #0066CC;
                background: #fff;
              }
              .djomy-btn-primary {
                width: 100%;
                padding: 13px;
                border: none;
                border-radius: 11px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.15s, transform 0.1s;
                letter-spacing: 0.2px;
              }
              .djomy-btn-primary:hover { opacity: 0.92; }
              .djomy-btn-primary:active { transform: scale(0.98); }
              .djomy-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
              .djomy-btn-back {
                background: none;
                border: 1.5px solid #E0E5EE;
                border-radius: 10px;
                padding: 11px 20px;
                font-size: 14px;
                color: #667085;
                cursor: pointer;
                transition: background 0.15s;
              }
              .djomy-btn-back:hover { background: #F6F8FB; }
            `}</style>

            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #003D99 0%, #0066CC 100%)",
                padding: "20px 24px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect
                    width="32"
                    height="32"
                    rx="8"
                    fill="rgba(255,255,255,0.15)"
                  />
                  <text
                    x="16"
                    y="21"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#fff"
                    letterSpacing="0.5"
                  >
                    DJ
                  </text>
                </svg>
                <div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: 0.3,
                    }}
                  >
                    Djomy Pay
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5 }}
                  >
                    {t("payment.securePayment")}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  color: "#fff",
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Amount banner */}
            {step !== "success" && step !== "error" && (
              <div
                style={{
                  background: "#F0F5FF",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #E8ECF0",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#667085",
                      marginBottom: 2,
                    }}
                  >
                    {description}
                  </div>
                  <div style={{ fontSize: 11, color: "#9BA8C0" }}>
                    {t("payment.stampType")}: {typeTimbre}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#003D99",
                    letterSpacing: -0.5,
                  }}
                >
                  {formatAmount(amount)}
                </div>
              </div>
            )}

            {/* Progress stepper */}
            {step !== "success" && step !== "error" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 24px 0",
                  gap: 0,
                }}
              >
                {(["method", "details", "otp"] as Step[]).map((s, i) => {
                  const steps: Step[] = ["method", "details", "otp"];
                  const currentIdx = steps.indexOf(step);
                  const isActive = i === currentIdx;
                  const isDone = i < currentIdx;
                  return (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: i < 2 ? 1 : undefined,
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: isDone
                            ? "#0066CC"
                            : isActive
                              ? "#0066CC"
                              : "#E8ECF0",
                          color: isDone || isActive ? "#fff" : "#9BA8C0",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
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
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1A2035",
                      marginBottom: 4,
                    }}
                  >
                    {t("payment.paymentMethod")}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#667085", marginBottom: 16 }}
                  >
                    {t("payment.chooseMethod")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <div
                        key={m.id}
                        className={`djomy-method-card${selectedMethod === m.id ? " selected" : ""}`}
                        style={
                          {
                            ["--djomy-accent" as string]: m.color,
                            ["--djomy-accent-bg" as string]: m.color + "12",
                          } as React.CSSProperties
                        }
                        onClick={() => handleSelectMethod(m.id)}
                      >
                        <div style={{ flexShrink: 0 }}>{m.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#1A2035",
                            }}
                          >
                            {t(m.labelKey)}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${selectedMethod === m.id ? m.color : "#CBD5E1"}`,
                            background:
                              selectedMethod === m.id ? m.color : "transparent",
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
                    <div style={{ color: "#C00", fontSize: 13, marginTop: 12 }}>
                      {error}
                    </div>
                  )}

                  <button
                    className="djomy-btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #003D99, #0066CC)",
                      color: "#fff",
                      marginTop: 20,
                    }}
                    onClick={handleMethodNext}
                  >
                    {t("payment.continue")} →
                  </button>
                </div>
              )}

              {/* STEP 2 – Payment details */}
              {step === "details" && method && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    {method.icon}
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#1A2035",
                      }}
                    >
                      {t(method.labelKey)}
                    </div>
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#667085", marginBottom: 18 }}
                  >
                    {isMobile
                      ? t("payment.enterPhoneNumber")
                      : t("payment.enterCardInfo")}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#344054",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        {t(method.inputLabelKey)}
                      </label>
                      <input
                        className="djomy-input"
                        type={method.type}
                        placeholder={t(method.placeholderKey)}
                        value={phoneOrCard}
                        onChange={(e) => {
                          if (isCard) {
                            setPhoneOrCard(formatCardNumber(e.target.value));
                          } else {
                            setPhoneOrCard(
                              e.target.value.replace(/\D/g, "").slice(0, 12),
                            );
                          }
                        }}
                      />
                    </div>

                    {isCard && (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "#344054",
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              {t("payment.expiry")}
                            </label>
                            <input
                              className="djomy-input"
                              placeholder="MM/AA"
                              value={expiry}
                              maxLength={5}
                              onChange={(e) =>
                                setExpiry(formatExpiry(e.target.value))
                              }
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                color: "#344054",
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              CVV
                            </label>
                            <input
                              className="djomy-input"
                              placeholder="123"
                              value={cvv}
                              maxLength={4}
                              onChange={(e) =>
                                setCvv(
                                  e.target.value.replace(/\D/g, "").slice(0, 4),
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "#344054",
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            {t("payment.cardHolder")}
                          </label>
                          <input
                            className="djomy-input"
                            placeholder={t("payment.cardHolderPlaceholder")}
                            value={cardHolder}
                            onChange={(e) =>
                              setCardHolder(e.target.value.toUpperCase())
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div style={{ color: "#C00", fontSize: 13, marginTop: 12 }}>
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      className="djomy-btn-back"
                      onClick={() => setStep("method")}
                    >
                      ← {t("payment.back")}
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
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
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
                          {t("payment.verifying")}
                        </span>
                      ) : (
                        t("payment.validate") + " →"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 – OTP */}
              {step === "otp" && (
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1A2035",
                      marginBottom: 4,
                    }}
                  >
                    {t("payment.confirmationCode")}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#667085", marginBottom: 4 }}
                  >
                    {isMobile
                      ? t("payment.otpSent", { phone: phoneOrCard })
                      : t("payment.enter3dSecure")}
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
                    {t("payment.resendCode")}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                      marginBottom: 24,
                    }}
                  >
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
                    <div
                      style={{
                        fontSize: 12,
                        color: "#4A6FA5",
                        lineHeight: 1.4,
                      }}
                    >
                      {t("payment.secureTransaction")}
                    </div>
                  </div>

                  {error && (
                    <div
                      style={{ color: "#C00", fontSize: 13, marginBottom: 12 }}
                    >
                      {error}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="djomy-btn-back"
                      onClick={() => setStep("details")}
                    >
                      ← {t("payment.back")}
                    </button>
                    <button
                      className="djomy-btn-primary"
                      style={{
                        background: "linear-gradient(135deg, #0A7A3E, #0DBF5E)",
                        color: "#fff",
                        flex: 1,
                      }}
                      onClick={handleConfirm}
                      disabled={chargement}
                    >
                      {chargement ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
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
                            className="loading loading-sm loading-spinner"
                          />
                        </span>
                      ) : (
                        `${t("payment.pay")} ${formatAmount(amount)}`
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 – Success */}
              {step == "success" && (
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
                      <circle
                        cx="18"
                        cy="18"
                        r="17"
                        stroke="#0DBF5E"
                        strokeWidth="2"
                      />
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

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1A2035",
                      marginBottom: 6,
                    }}
                  >
                    {t("payment.paymentInitiated")}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#667085",
                      marginBottom: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    {t("payment.paymentInitiatedMessage", {
                      amount: formatAmount(amount),
                    })}
                    <br />
                    <span>
                      {t("payment.waitingConfirmation")}:
                   
                    </span>
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.method")}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1A2035",
                        }}
                      >
                        {method && t(method.labelKey)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.amount")}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1A2035",
                        }}
                      >
                        {formatAmount(amount)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.reference")}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0066CC",
                          fontFamily: "monospace",
                        }}
                      >
                        {typeTimbre}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full items-center justify-center">
                      <a
                        href={lien}
                        className="btn btn-wide btn-info btn-outline btn-ghost"
                      >
                        {t("payment.confirm")}
                  </a>
                  <button
                    className="djomy-btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #003D99, #0066CC)",
                      color: "#fff",
                    }}
                    onClick={handleClose}
                  >
                    {t("payment.close")}
                  </button>
                  </div>
                
                </div>
              )}

              {/* STEP 5 – Error */}
              {step == "error" && (
                <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "#FDECEC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle
                        cx="18"
                        cy="18"
                        r="17"
                        stroke="#BF0D0D"
                        strokeWidth="2"
                      />
                      <path
                        d="M10 10L26 26M26 10L10 26"
                        stroke="#BF0D0D"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="60"
                        strokeDashoffset="0"
                        style={{ animation: "djomyCheck 0.4s ease forwards" }}
                      />
                    </svg>
                  </div>

                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1A2035",
                      marginBottom: 6,
                    }}
                  >
                    {t("payment.paymentFailed")}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#884646",
                      marginBottom: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    {t("payment.paymentFailedMessage", {
                      amount: formatAmount(amount),
                    })}
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.method")}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1A2035",
                        }}
                      >
                        {method && t(method.labelKey)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.amount")}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1A2035",
                        }}
                      >
                        {formatAmount(amount)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#667085" }}>
                        {t("payment.stampType")}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0066CC",
                          fontFamily: "monospace",
                        }}
                      >
                        {typeTimbre}
                      </span>
                    </div>
                  </div>

                  <button
                    className="djomy-btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #003D99, #0066CC)",
                      color: "#fff",
                    }}
                    onClick={handleClose}
                  >
                    {t("payment.close")}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {step !== "success" && step !== "error" && (
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
                  {t("payment.securedBy")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
