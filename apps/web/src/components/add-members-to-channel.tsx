import type { Channel, ChannelParticipant, User } from "@hono-orpc/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import AddUsers from "@/components/add-users";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { orpc } from "@/lib/orpc-client";

const addMembersSchema = z.object({
  members: z.array(z.string()).min(1),
});

function AddMembersToChannel({
  channel,
}: {
  channel: Channel & {
    participants:
      | (Omit<ChannelParticipant, "role"> & {
          user: User | null;
          role: unknown;
        })[]
      | null;
  };
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      members: [],
    },
  });

  const queryClient = useQueryClient();

  const { mutateAsync: addMembersToChannel, isPending } = useMutation(
    orpc.chat.channel.addMembersToChannel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.chat.channel.getChannel.queryKey({
            input: { uuid: channel.uuid },
          }),
        });
        setOpen(false);
      },
    })
  );

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button className="w-full" variant="outline">
          <Plus />
          Add Members
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Members to Channel</DrawerTitle>
          <DrawerDescription>
            Search and select users to add them as members to this channel.
          </DrawerDescription>
        </DrawerHeader>

        <div className="h-full overflow-y-auto p-4">
          <Form {...form}>
            <form
              id="add-members-to-channel-form"
              onSubmit={form.handleSubmit((data) =>
                addMembersToChannel({
                  uuid: channel.uuid,
                  memberIds: data.members,
                })
              )}
            >
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-onnly">Members</FormLabel>
                    <FormControl>
                      <AddUsers
                        initialUsers={channel?.participants?.map((p) => p.user)}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter>
          <Button
            disabled={isPending}
            form="add-members-to-channel-form"
            type="submit"
          >
            {isPending && <Loader className="animate-spin" />}
            Add Members
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default AddMembersToChannel;
