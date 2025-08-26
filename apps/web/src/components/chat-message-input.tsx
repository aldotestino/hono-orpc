import {
  type Channel,
  type MessageInput,
  messagesInputSchema,
} from '@hono-orpc/db/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { orpc } from '@/lib/orpc-client';

function ChatMessageInput({
  channel,
  sender,
}: {
  channel: Channel;
  sender: string;
}) {
  const form = useForm({
    resolver: zodResolver(messagesInputSchema),
    defaultValues: {
      channelUuid: channel.uuid,
      sender,
      content: '',
    },
  });

  const { mutateAsync: sendMessage, isPending } = useMutation(
    orpc.chat.sendMessage.mutationOptions({
      onMutate: () => {
        form.reset();
      },
    })
  );

  const onSubmit = (data: MessageInput) => {
    sendMessage(data);
  };

  return (
    <div className="border-t p-4">
      <Form {...form}>
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder={`Send a message to #${channel.name} as ${sender}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit">
              {isPending ? <Loader className="animate-spin" /> : <Send />}
              Send
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ChatMessageInput;
