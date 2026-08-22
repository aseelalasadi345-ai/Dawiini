import { useTranslations } from "next-intl";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm p-8">
      <div className="text-center mb-6">
        <div className="text-lg font-bold mb-4">Dawiini</div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
      </div>
      <LoginForm />
    </div>
  );
}