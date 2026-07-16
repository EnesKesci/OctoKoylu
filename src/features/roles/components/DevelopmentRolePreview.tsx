import { ROLE_CATALOG } from '@/features/roles'
import type { RoleAssignment, RoleTeam } from '@/features/roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DevelopmentRolePreviewProps {
    assignment: RoleAssignment
    allAssignments: RoleAssignment[]
    onBack: () => void
}

const TEAM_LABELS: Record<RoleTeam, string> = {
    village: 'Köylü Takımı',
    vampire: 'Vampir Takımı',
    independent: 'Bağımsız',
}

export function DevelopmentRolePreview({ assignment, allAssignments, onBack }: DevelopmentRolePreviewProps) {
    const roleDef = ROLE_CATALOG[assignment.roleCode]
    const teamLabel = roleDef ? TEAM_LABELS[roleDef.team] : ''

    const vampireTeamAssignments = roleDef?.team === 'vampire'
        ? allAssignments.filter(
            (a) =>
                a.playerId !== assignment.playerId &&
                ROLE_CATALOG[a.roleCode]?.team === 'vampire',
        )
        : []

    return (
        <Card className="border-slate-700 bg-slate-900">
            <CardHeader>
                <CardTitle className="text-white">Rolün</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="text-sm text-slate-400">Oyuncu</p>
                    <p className="text-lg font-semibold text-white">{assignment.displayName}</p>
                </div>

                {roleDef && (
                    <>
                        <div>
                            <p className="text-sm text-slate-400">Rolün</p>
                            <p className="text-lg font-semibold text-white">{roleDef.name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">Açıklama</p>
                            <p className="text-sm text-slate-300">{roleDef.shortDescription}</p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400">Takım</p>
                            <p className="text-sm font-semibold text-white">{teamLabel}</p>
                        </div>
                    </>
                )}

                {vampireTeamAssignments.length > 0 && (
                    <div>
                        <p className="text-sm text-slate-400">Vampir Takımın</p>
                        <ul className="mt-1 space-y-1">
                            {vampireTeamAssignments.map((vampire) => (
                                <li key={vampire.playerId} className="text-sm text-slate-300">
                                    {vampire.displayName}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Button type="button" variant="outline" onClick={onBack} className="w-full">
                    Geri
                </Button>
            </CardContent>
        </Card>
    )
}