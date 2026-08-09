export function CountedTabLabel({ label, count }: { label: string; count: number }) {
  return <span className="counted-tab-label"><span>{label}</span><b>{count}</b></span>;
}
