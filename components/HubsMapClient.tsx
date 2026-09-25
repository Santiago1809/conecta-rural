"use client";

import dynamic from "next/dynamic";

const HubsMap = dynamic(() => import("@/components/HubsMap"), {
  ssr: false,
  loading: () => <div className="h-[28rem] w-full animate-pulse rounded-2xl bg-soft" />,
});

export default function HubsMapClient() {
  return <HubsMap />;
}