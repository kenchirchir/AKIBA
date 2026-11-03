import { getResearchReport } from "@/lib/admin/data";
import { toCsv } from "@/lib/admin/csv";
import { kigaliDate } from "@/lib/requests/options";

const reports = ["garments", "participants"] as const;

export async function GET(
  _request: Request,
  { params }: RouteContext<"/admin/export/[report]">,
) {
  const { report } = await params;
  const name = reports.find((item) => item === report);
  if (!name) return new Response(null, { status: 404 });

  const data = await getResearchReport();

  return new Response(toCsv(data[name]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="akiba-${name}-${kigaliDate()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
