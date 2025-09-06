import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import AddUsers from '@/components/add-users';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { orpc } from '@/lib/orpc-client';

const channelSchema = z.object({
  name: z.string().min(1),
  members: z.array(z.string()).min(1),
});

function NewChannel() {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const queryClient = useQueryClient();

  const { mutateAsync: createChannel, isPending } = useMutation(
    orpc.chat.createChannel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.chat.getChannels.queryKey(),
        });
        form.reset();
        setOpen(false);
      },
    })
  );

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button>
          <Plus />
          Channel
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90%]">
        <DrawerHeader>
          <DrawerTitle>Create a new channel</DrawerTitle>
          <DrawerDescription>
            Create a new channel to chat with your friends.
          </DrawerDescription>
        </DrawerHeader>

        <div className="h-full overflow-y-auto p-4">
          <Form {...form}>
            <form
              className="w-full space-y-6"
              id="create-channel-form"
              onSubmit={form.handleSubmit((data) => createChannel(data))}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Channel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Members</FormLabel>
                    <FormControl>
                      <AddUsers onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter>
          <Button disabled={isPending} form="create-channel-form" type="submit">
            {isPending ? <Loader className="animate-spin" /> : 'Create'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default NewChannel;
