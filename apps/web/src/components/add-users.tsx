import type { User } from "@hono-orpc/db/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader, Search, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import UserListItem from "@/components/user-list-item";
import { useStateWithDebounce } from "@/lib/hooks/use-debounce";
import { orpc } from "@/lib/orpc-client";

function AddUsers({
  initialUsers = [],
  onChange,
}: {
  initialUsers?: (User | null)[];
  onChange: (users: string[]) => void;
}) {
  const {
    debouncedValue,
    value,
    onChange: onChangeDebounced,
  } = useStateWithDebounce("");

  const [users, setUsers] = useState<User[]>([]);

  const { data: foundUsers, isLoading } = useQuery(
    orpc.user.searchUser.queryOptions({
      input: { query: debouncedValue },
      enabled: debouncedValue !== "",
    })
  );

  function handleAddRemoveUser(user: User) {
    const userExists = users.some((u) => u.id === user.id);
    const newUsers = userExists
      ? users.filter((u) => u.id !== user.id)
      : [...users, user];
    setUsers(newUsers);
    onChange(newUsers.map((u) => u.id));
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          className="peer ps-9"
          onChange={onChangeDebounced}
          placeholder="Search for a user"
          value={value}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          {isLoading ? (
            <Loader aria-hidden="true" className="animate-spin" size={16} />
          ) : (
            <Search aria-hidden="true" size={16} />
          )}
        </div>
      </div>
      {users.length > 0 && (
        <Card className="p-0">
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-2 p-2">
              {users.map((user) => (
                <div className="relative w-16" key={user.id}>
                  <UserListItem orientation="vertical" user={user} />
                  <Button
                    className="-translate-y-[4px] absolute top-0 left-1/2 size-6 translate-x-[4px] rounded-full hover:bg-background"
                    onClick={() => handleAddRemoveUser(user)}
                    size="icon"
                    variant="secondary"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {foundUsers && foundUsers.length > 0 && (
        <Card className="p-0">
          <CardContent className="divide-y divide-border p-0">
            {foundUsers.map((user) => (
              <label
                className="flex items-center justify-between gap-2 p-2"
                htmlFor={user.id}
                key={user.id}
              >
                <UserListItem user={user} />
                <Checkbox
                  checked={[...users, ...initialUsers].some(
                    (u) => u?.id === user.id
                  )}
                  disabled={initialUsers.some((u) => u?.id === user.id)}
                  id={user.id}
                  onCheckedChange={() => handleAddRemoveUser(user)}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AddUsers;
