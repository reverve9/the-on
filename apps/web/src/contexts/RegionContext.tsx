import { createContext, useContext, ReactNode, useMemo } from 'react'
import { getRegionFromHost, getRegionName } from '@the-on/shared'

interface RegionContextType {
  regionSlug: string    // gangneung, sokcho, donghae...
  regionName: string    // 강릉, 속초, 동해...
  regionId?: string     // DB에서 가져온 UUID (추후 연동)
}

const RegionContext = createContext<RegionContextType | null>(null)

interface RegionProviderProps {
  children: ReactNode
}

export function RegionProvider({ children }: RegionProviderProps) {
  const value = useMemo(() => {
    const regionSlug = getRegionFromHost()
    const regionName = getRegionName(regionSlug)
    
    return {
      regionSlug,
      regionName,
      // regionId는 추후 Supabase에서 가져와서 설정
    }
  }, [])

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext)
  
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider')
  }
  
  return context
}
