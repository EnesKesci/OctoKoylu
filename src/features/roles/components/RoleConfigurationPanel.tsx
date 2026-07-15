import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDefaultRoleConfiguration, ROLE_CATALOG, createRoleAssignments } from '@/features/roles'
import type { RoleCode, RoleAssignmentPlayer, RoleAssignment, RoleTemplateItem } from '@/features/roles'
import { getRoomRoleConfiguration, saveRoomRoleConfiguration } from '@/features/rooms/api/roomRoleConfigurationApi'

interface RoleConfigurationPanelProps {
  roomId: string
  playerCount: number
  players: RoleAssignmentPlayer[]
  onPreview: (assignments: RoleAssignment[], roles: RoleTemplateItem[]) => void
  onClose: () => void
}

interface RoleState {
  roleCode: RoleCode
  count: number
}

export function RoleConfigurationPanel({ roomId, playerCount, players, onPreview, onClose }: RoleConfigurationPanelProps) {
  const [roles, setRoles] = useState<RoleState[]>([])
  const [config, setConfig] = useState<ReturnType<typeof getDefaultRoleConfiguration> | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoadingConfiguration, setIsLoadingConfiguration] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadConfiguration() {
      setIsLoadingConfiguration(true)
      setLoadError(null)

      try {
        const saved = await getRoomRoleConfiguration(roomId)

        if (!mounted) return

        if (saved && saved.playerCount === playerCount) {
          const savedMap = new Map(saved.roles.map((item) => [item.roleCode, item.count]))
          const allRoles = Object.keys(ROLE_CATALOG) as RoleCode[]
          const newRoles = allRoles.map((code) => ({
            roleCode: code,
            count: savedMap.get(code) ?? 0,
          }))

          const template = getDefaultRoleConfiguration(playerCount)
          setRoles(newRoles)
          setConfig(template)
        } else {
          const template = getDefaultRoleConfiguration(playerCount)
          if (!template) {
            setRoles([])
            setConfig(null)
          } else {
            const defaultMap = new Map(template.roles.map((item) => [item.roleCode, item.count]))
            const allRoles = Object.keys(ROLE_CATALOG) as RoleCode[]
            const newRoles = allRoles.map((code) => ({
              roleCode: code,
              count: defaultMap.get(code) ?? 0,
            }))
            setRoles(newRoles)
            setConfig(template)
          }
        }
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : ''
        setLoadError(message ? `Rol konfigürasyonu yüklenemedi. ${message}` : 'Rol konfigürasyonu yüklenemedi.')

        const template = getDefaultRoleConfiguration(playerCount)
        if (!template) {
          setRoles([])
          setConfig(null)
        } else {
          const defaultMap = new Map(template.roles.map((item) => [item.roleCode, item.count]))
          const allRoles = Object.keys(ROLE_CATALOG) as RoleCode[]
          const newRoles = allRoles.map((code) => ({
            roleCode: code,
            count: defaultMap.get(code) ?? 0,
          }))
          setRoles(newRoles)
          setConfig(template)
        }
      } finally {
        if (mounted) {
          setIsLoadingConfiguration(false)
        }
      }
    }

    void loadConfiguration()

    return () => {
      mounted = false
    }
  }, [roomId, playerCount])

  if (!config) {
    return (
      <Card className="border-slate-700 bg-slate-900">
        <CardContent className="pt-6">
          <p className="text-sm text-slate-300">
            Bu oyuncu sayısı için hazır rol şablonu bulunmuyor.
          </p>
          <p className="mt-2 text-sm text-slate-400">Desteklenen oyuncu sayısı: 6–14.</p>
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRoles = roles.reduce((sum, item) => sum + item.count, 0)

  const villageRoleCount = roles.reduce((sum, item) => {
    const roleDef = ROLE_CATALOG[item.roleCode]
    return roleDef.team === 'village' ? sum + item.count : sum
  }, 0)

  const vampireRoleCount = roles.reduce((sum, item) => {
    const roleDef = ROLE_CATALOG[item.roleCode]
    return roleDef.team === 'vampire' ? sum + item.count : sum
  }, 0)

  const hasValidTotal = totalRoles === playerCount
  const hasVillageRole = villageRoleCount > 0
  const hasVampireRole = vampireRoleCount > 0

  const isConfigurationValid =
    hasValidTotal &&
    hasVillageRole &&
    hasVampireRole

  const isDisabled = isSaving || isLoadingConfiguration

  function handleDecrement(roleCode: RoleCode) {
    setSaveSuccess(false)
    setSaveError(null)
    setPreviewError(null)
    setRoles((prev) =>
      prev.map((item) =>
        item.roleCode === roleCode ? { ...item, count: Math.max(0, item.count - 1) } : item,
      ),
    )
  }

  function handleIncrement(roleCode: RoleCode) {
    setSaveSuccess(false)
    setSaveError(null)
    setPreviewError(null)
    const roleDef = ROLE_CATALOG[roleCode]
    if (!roleDef) return

    setRoles((prev) => {
      const currentTotal = prev.reduce((sum, item) => sum + item.count, 0)

      if (currentTotal >= playerCount) return prev

      return prev.map((item) => {
        if (item.roleCode !== roleCode) return item

        if (roleDef.isUnique) {
          return item.count < 1 ? { ...item, count: 1 } : item
        }

        return { ...item, count: item.count + 1 }
      })
    })
  }

  async function handleSave() {
    if (isSaving || !isConfigurationValid) return

    setSaveError(null)
    setSaveSuccess(false)
    setIsSaving(true)

    try {
      await saveRoomRoleConfiguration({
        roomId,
        playerCount,
        roles: roles.filter((role) => role.count > 0),
      })
      setSaveSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setSaveError(message ? `Rol konfigürasyonu kaydedilemedi. ${message}` : 'Rol konfigürasyonu kaydedilemedi.')
    } finally {
      setIsSaving(false)
    }
  }

  function handlePreview() {
    setPreviewError(null)

    const activeRoles = roles
      .filter((role) => role.count > 0)
      .map((role) => ({ roleCode: role.roleCode, count: role.count }))

    try {
      const assignments = createRoleAssignments({ players, roles: activeRoles })
      onPreview(assignments, activeRoles)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setPreviewError(message ? `Rol dağıtımı oluşturulamadı. ${message}` : 'Rol dağıtımı oluşturulamadı.')
    }
  }

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader>
        <CardTitle className='text-white'>Rol Konfigürasyonu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300">{config.templateName}</p>
          <p className="mt-1 text-sm text-slate-400">Oyuncu sayısı: {config.playerCount}</p>
        </div>

        {loadError && (
          <p className="text-sm text-amber-400">{loadError}</p>
        )}

        {isLoadingConfiguration ? (
          <p className="text-sm text-slate-300">Rol konfigürasyonu yükleniyor...</p>
        ) : undefined}
        {!isLoadingConfiguration && (
          <>
            <div className="space-y-2">
              {roles.map((item) => {
                const roleDef = ROLE_CATALOG[item.roleCode]
                if (!roleDef) return null

                const canDecrement = !isDisabled && item.count > 0
                const canIncrement =
                  !isDisabled &&
                  (roleDef.isUnique
                    ? item.count < 1 && totalRoles < playerCount
                    : totalRoles < playerCount)

                return (
                  <div key={item.roleCode} className="flex items-center justify-between rounded bg-slate-800 p-2">
                    <span className="text-sm text-slate-300">{roleDef.name}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!canDecrement}
                        onClick={() => handleDecrement(item.roleCode)}
                        className="h-8 w-8 p-0"
                      >
                        −
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-100">{item.count}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!canIncrement}
                        onClick={() => handleIncrement(item.roleCode)}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded border border-slate-700 bg-slate-950 p-2">
              <p className="text-sm text-slate-300">
                Seçilen roller: <span className="font-semibold">{totalRoles} / {playerCount}</span>
              </p>
            </div>

            <div className="space-y-1">
              {totalRoles < playerCount && (
                <p className="text-sm text-amber-400">
                  {playerCount - totalRoles} rol daha eklemelisiniz.
                </p>
              )}
              {hasValidTotal && !isConfigurationValid && (
                <p className="text-sm text-green-400">
                  Rol sayısı oyuncu sayısıyla eşleşiyor.
                </p>
              )}
              {villageRoleCount === 0 && (
                <p className="text-sm text-amber-400">
                  En az 1 köylü takımı rolü seçmelisiniz.
                </p>
              )}
              {vampireRoleCount === 0 && (
                <p className="text-sm text-amber-400">
                  En az 1 vampir takımı rolü seçmelisiniz.
                </p>
              )}
              {isConfigurationValid && (
                <p className="text-sm text-green-400">
                  Rol konfigürasyonu geçerli.
                </p>
              )}
            </div>

            {saveError && (
              <p className="text-sm text-rose-400">{saveError}</p>
            )}

            {previewError && (
              <p className="text-sm text-rose-400">{previewError}</p>
            )}

            {saveSuccess && (
              <p className="text-sm text-green-400">Rol konfigürasyonu kaydedildi.</p>
            )}

            <Button
              type="button"
              disabled={!isConfigurationValid || isDisabled}
              onClick={handlePreview}
              className="w-full"
            >
              Dağıtımı Önizle
            </Button>

            <Button
              type="button"
              disabled={!isConfigurationValid || isDisabled}
              onClick={handleSave}
              className="w-full"
            >
              {isSaving ? 'Kaydediliyor...' : 'Konfigürasyonu Kaydet'}
            </Button>
          </>
        )}

        <Button type="button" variant="outline" disabled={isDisabled} onClick={onClose} className="w-full">
          Kapat
        </Button>
      </CardContent>
    </Card>
  )
}