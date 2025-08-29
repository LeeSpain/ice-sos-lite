import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'owner' | 'family_member' | 'none';

interface FamilyRoleData {
  role: UserRole;
  familyGroupId?: string;
  isOwner: boolean;
  isFamilyMember: boolean;
}

export function useFamilyRole() {
  return useQuery({
    queryKey: ['family-role'],
    queryFn: async (): Promise<FamilyRoleData> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return { role: 'none', isOwner: false, isFamilyMember: false };
        }

        // Check if user is a family group owner
        const { data: ownedGroup } = await supabase
          .from('family_groups')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (ownedGroup) {
          return {
            role: 'owner',
            familyGroupId: ownedGroup.id,
            isOwner: true,
            isFamilyMember: false
          };
        }

        // Check if user is a family member
        const { data: membership } = await supabase
          .from('family_memberships')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (membership) {
          return {
            role: 'family_member',
            familyGroupId: membership.group_id,
            isOwner: false,
            isFamilyMember: true
          };
        }

        return { role: 'none', isOwner: false, isFamilyMember: false };

      } catch (error) {
        console.error('Error checking family role:', error);
        return { role: 'none', isOwner: false, isFamilyMember: false };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}