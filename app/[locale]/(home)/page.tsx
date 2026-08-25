import { Link } from "@/i18n/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import TodayDosesWidget from "./TodayDosesWidget";
import { todayDoses } from "@/lib/mock/doses";

const recentSearches = [
  "Paracetamol 500mg",
  "Amoxicillin 250mg",
  "Metformin 850mg",
  "Omeprazole 20mg",
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const format = await getFormatter();
  const today = format.dateTime(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("greeting", { name: "Sara" })} 👋
        </h1>
        <p className="text-sm text-muted mt-0.5">{today}</p>
      </div>

      {/* Big search */}
      <Link
        href="/search"
        className="w-full flex items-center gap-3 bg-white border border-border rounded-2xl px-5 py-4 shadow-sm transition-all hover:border-hover-border hover:shadow-md active:scale-[0.99]"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-primary"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <span className="text-muted text-base">{t("searchPlaceholder")}</span>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/search/scan"
          className="bg-white border border-border rounded-xl shadow-sm transition-all hover:border-hover-border hover:shadow-md active:scale-[0.99] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-primary/10 to-accent/10">
            📷
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {t("scanPrescription")}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {t("scanPrescriptionSub")}
            </div>
          </div>
        </Link>
        <Link
          href="/pharmacies"
          className="bg-white border border-border rounded-xl shadow-sm transition-all hover:border-hover-border hover:shadow-md active:scale-[0.99] p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br from-accent/10 to-accent/5">
            🗺️
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {t("findPharmacies")}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {t("findPharmaciesSub")}
            </div>
          </div>
        </Link>
      </div>

      {/* Today's doses — interactive, client component */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">{t("todayDoses")}</h2>
          <Link
            href="/today"
            className="text-xs text-primary font-medium hover:underline"
          >
            {t("seeAll")}
          </Link>
        </div>
        <TodayDosesWidget initialDoses={todayDoses} />
      </div>

      {/* Recent searches */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">
          {t("recentSearches")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((s) => (
            <Link
              key={s}
              href={{ pathname: "/results", query: { q: s } }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-border text-sm text-foreground shadow-sm transition-all hover:border-hover-border hover:text-primary active:scale-[0.97]"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-4.15" />
              </svg>
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
