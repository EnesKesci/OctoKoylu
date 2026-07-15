import { ROLE_CATALOG } from '@/features/roles'
import type { RoleAssignment } from '@/features/roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RoleAssignmentPreviewProps {
    assignments: RoleAssignment[]
    error: string | null
    onRedistribute: () => void
    onBack: () => void
}

export function RoleAssignmentPreview({ assignments, error, onRedistribute, onBack }: RoleAssignmentPreviewProps) {
    return (
        <Card className="border-slate-700 bg-slate-900">
            <CardHeader>
                <CardTitle className='text-white'>Rol Dağıtımı Ön İzleme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {assignments.map((item) => {
                        const roleDef = ROLE_CATALOG[item.roleCode]
                        return (
                            <div key={item.playerId} className="flex items-center justify-between rounded bg-slate-800 p-2">
                                <span className="text-sm text-slate-300">{item.displayName}</span>
                                <span className="text-sm font-semibold text-slate-100">{roleDef?.name ?? item.roleCode}</span>
                            </div>
                        )
                    })}
                </div>

                {error && (
                    <p className="text-sm text-rose-400">{error}</p>
                )}

                <Button type="button" onClick={onRedistribute} className="w-full">
                    Yeniden Dağıt
                </Button>

                <Button type="button" variant="outline" onClick={onBack} className="w-full">
                    Geri
                </Button>
            </CardContent>
        </Card>
    )
}