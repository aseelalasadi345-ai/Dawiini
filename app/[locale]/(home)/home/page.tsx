import { Link } from "@/i18n/navigation";
import { getTranslations, getFormatter } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import TodayDosesWidget from "../TodayDosesWidget";

export default async function HomePage() {
  const t = await getTranslations("home");
  const format = await getFormatter();
  const today = format.dateTime(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Real per-user history now (was a hardcoded array) — recorded when a
  // search result is actually selected (see
  // app/[locale]/(home)/search/page.tsx's handleSelect), same data the
  // Search page's own "Recent Searches" section reads.
  const sessionUser = await getSessionUser();
  const [dbUser, recentSearches] = sessionUser
    ? await Promise.all([
        prisma.user.findUnique({ where: { id: sessionUser.id }, select: { firstName: true } }),
        prisma.recentSearch.findMany({
          where: { userId: sessionUser.id },
          include: { catalogEntry: { select: { id: true, name: true, strength: true } } },
          orderBy: { updatedAt: "desc" },
          take: 4,
        }),
      ])
    : [null, []];

  // firstName is required at signup so this should always be set — same
  // defensive fallback as Navbar's avatarInitial (email, then a generic
  // placeholder), never a hardcoded name.
  const displayName = dbUser?.firstName ?? sessionUser?.email?.split("@")[0] ?? "there";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("greeting", { name: displayName })} 👋
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <TodayDosesWidget />
      </div>

      {/* Recent searches — real per-user history (see the query above);
          hidden entirely when there's none yet, rather than showing an
          empty heading. */}
      {recentSearches.length > 0 && (
        <div>
          <h2 className="font-semibold text-foreground mb-3">
            {t("recentSearches")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((r) => (
              <Link
                key={r.catalogEntryId}
                href={`/medications/${r.catalogEntryId}`}
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
                {r.catalogEntry.name} {r.catalogEntry.strength}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
