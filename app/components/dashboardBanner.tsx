import type { FC, ReactNode } from "react";

type BannerVariant = "welcome" | "danger" | "warning";

interface BannerProps {
  variant: BannerVariant;
  username?: string;
  description: string | ReactNode;
}

const BANNER_CONFIGS = {
  welcome: (username?: string) => ({
    title: `👋 Hey, ${username || "Felix"}`,
  }),
  danger: () => ({
    title: "⛔ We are in danger",
  }),
  warning: () => ({
    title: "⚠️ Wait a minute",
  }),
} as const;

export const DashboardBanner: FC<BannerProps> = ({
  variant,
  username,
  description,
}) => {
  const config = BANNER_CONFIGS[variant](username);

  return (
    <div className="flex flex-col sm:gap-4 gap-2 sm:mt-0 mt-3">
      <h1 className="sm:text-heading-h1 text-heading-h2 text-base-black">
        {config.title}
      </h1>
      <p className="sm:text-neutral-01 text-body-lg text-base-black">
        {description}
      </p>
    </div>
  );
};

export default DashboardBanner;
