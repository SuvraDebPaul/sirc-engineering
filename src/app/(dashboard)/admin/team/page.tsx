import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { auth } from "@/lib/db/auth";
import { listStaffAdmin } from "@/features/account/services/team-admin";
import { PromoteUserForm } from "@/features/account/components/promote-user-form";
import { StaffRoleSelect } from "@/features/account/components/staff-role-select";
import { formatDate } from "@/lib/format";

export default async function AdminTeamPage() {
  const [session, staff] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    listStaffAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who has admin access to this dashboard, and what they can do.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add someone to the team</CardTitle>
        </CardHeader>
        <CardContent>
          <PromoteUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current staff</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2 font-medium">Name</th>
                  <th className="px-6 py-2 font-medium">Email</th>
                  <th className="px-6 py-2 font-medium">Joined</th>
                  <th className="px-6 py-2 text-right font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => {
                  const isYou = member.id === session?.user.id;
                  return (
                    <tr key={member.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="font-medium">{member.name}</p>
                        {isYou && (
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            You
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{member.email}</td>
                      <td className="px-6 py-3 text-muted-foreground">{formatDate(member.createdAt)}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end">
                          <StaffRoleSelect
                            userId={member.id}
                            role={member.role as "admin" | "manager"}
                            disabled={isYou}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Admin and manager currently have identical access to this dashboard — there&apos;s no separate
        permission tier between them yet.
      </p>
    </div>
  );
}
