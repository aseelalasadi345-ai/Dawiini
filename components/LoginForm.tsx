"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("auth.errors");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // TODO: replace with real auth call
    console.log("login data", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-1.5">
          {t("identifierLabel")}
        </label>
        <input
          type="text"
          placeholder={t("identifierPlaceholder")}
          className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm"
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="text-red-500 text-xs mt-1">
            {tErrors(errors.identifier.message as string)}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold">
            {t("passwordLabel")}
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted"
          >
            👁
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">
            {tErrors(errors.password.message as string)}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" {...register("rememberMe")} />
        {t("rememberMe")}
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold disabled:opacity-60"
      >
        {isSubmitting ? t("loggingIn") : t("submit")}
      </button>

      <div className="relative text-center text-sm text-muted">
        <span className="bg-white px-3 relative z-10">
          {t("orContinueWith")}
        </span>
        <div className="absolute top-1/2 left-0 right-0 border-t border-border -z-0" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-border text-sm font-medium"
      >
        <span>G</span> {t("continueWithGoogle")}
      </button>

      <p className="text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="text-blue-600 font-medium hover:underline"
        >
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
}