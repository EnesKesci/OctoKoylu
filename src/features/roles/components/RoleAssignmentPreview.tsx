import { ROLE_CATALOG } from '@/features/roles'
import type { RoleAssignment } from '@/features/roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface RoleAssignmentPreviewProps {
    assignments: RoleAssignment[]
    error: string | null
    confirmationError: string | null
    isConfirming: boolean
    canConfirm: boolean
    confirmDisabledReason?: string
    onRedistribute: () => void
    onBack: () => void
    onConfirm: () => void
    onPreviewPlayerRole?: (assignment: RoleAssignment) => void
}

export function RoleAssignmentPreview({
    assignments,
    error,
    confirmationError,
    isConfirming,
    canConfirm,
    confirmDisabledReason,
    onRedistribute,
    onBack,
    onConfirm,
    onPreviewPlayerRole,
}: RoleAssignmentPreviewProps) {
    const isDisabled = isConfirming

    return (
        <Card className="border-slate-700 bg-slate-900">
            <CardHeader>
                <CardTitle className="text-white">Rol Dağıtımı Ön İzleme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {assignments.map((item) => {
                        const roleDef = ROLE_CATALOG[item.roleCode]
                        return (
                            <div key={item.playerId} className="flex items-center justify-between rounded bg-slate-800 p-2">
                                <span className="text-sm text-slate-300">{item.displayName}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-100">{roleDef?.name ?? item.roleCode}</span>
                                    {import.meta.env.DEV && onPreviewPlayerRole && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isDisabled}
                                            onClick={() => onPreviewPlayerRole(item)}
                                            className="h-7 text-xs"
                                        >
                                            Rol Ekranını Gör
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {error && (
                    <p className="text-sm text-rose-400">{error}</p>
                )}

                <Button type="button" disabled={isDisabled} onClick={onRedistribute} className="w-full">
                    Yeniden Dağıt
                </Button>

                <Button
                    type="button"
                    disabled={!canConfirm || isDisabled}
                    onClick={onConfirm}
                    className="w-full"
                >
                    {isConfirming ? 'Onaylanıyor...' : 'Dağıtımı Onayla'}
                </Button>

                {confirmationError && (
                    <p className="text-sm text-rose-400">{confirmationError}</p>
                )}

                {confirmDisabledReason && !confirmationError && (
                    <p className="text-xs text-slate-400">{confirmDisabledReason}</p>
                )}

                <Button type="button" variant="outline" disabled={isDisabled} onClick={onBack} className="w-full">
                    Geri
                </Button>
            </CardContent>
        </Card>
    )
}