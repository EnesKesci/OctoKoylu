import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDefaultRoleConfiguration, ROLE_CATALOG } from '@/features/roles'
import type { RoleCode } from '@/features/roles'

interface RoleConfigurationPanelProps {
  playerCount: number
  onClose: () => void
}

interface RoleState {
  roleCode: RoleCode
  count: number
}

export function RoleConfigurationPanel({ playerCount, onClose }: RoleConfigurationPanelProps) {
  const [roles, setRoles] = useState<RoleState[]>([])
  const [config, setConfig] = useState<ReturnType<typeof getDefaultRoleConfiguration> | null>(null)

  useEffect(() => {
    const template = getDefaultRoleConfiguration(playerCount)

    if (!template) {
      setRoles([])
      setConfig(null)
      return
    }

    const defaultMap = new Map(template.roles.map((item) => [item.roleCode, item.count]))
    const allRoles = Object.keys(ROLE_CATALOG) as RoleCode[]
    const newRoles = allRoles.map((code) => ({
      roleCode: code,
      count: defaultMap.get(code) ?? 0,
    }))
    setRoles(newRoles)
    setConfig(template)
  }, [playerCount])

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

  function handleDecrement(roleCode: RoleCode) {
    setRoles((prev) =>
      prev.map((item) =>
        item.roleCode === roleCode ? { ...item, count: Math.max(0, item.count - 1) } : item,
      ),
    )
  }

  function handleIncrement(roleCode: RoleCode) {
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

  return (
    <Card className="border-slate-700 bg-slate-900">
      <CardHeader>
        <CardTitle>Rol Konfigürasyonu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300">{config.templateName}</p>
          <p className="mt-1 text-sm text-slate-400">Oyuncu sayısı: {config.playerCount}</p>
        </div>

        <div className="space-y-2">
          {roles.map((item) => {
            const roleDef = ROLE_CATALOG[item.roleCode]
            if (!roleDef) return null

            const canDecrement = item.count > 0
            const canIncrement = roleDef.isUnique ? item.count < 1 && totalRoles < playerCount : totalRoles < playerCount

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

        <Button type="button" variant="outline" onClick={onClose} className="w-full">
          Kapat
        </Button>
      </CardContent>
    </Card>
  )
}
