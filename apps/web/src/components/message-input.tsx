import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { orpc } from '@/lib/orpc-client';

const messageInputSchema = z.object({
  content: z.string().min(1),
});

function MessageInput({ channelUuid }: { channelUuid: string }) {
  const form = useForm({
    resolver: zodResolver(messageInputSchema),
    defaultValues: {
      content: '',
    },
  });

  const { mutateAsync: sendMessage } = useMutation(
    orpc.chat.sendMessageToChannel.mutationOptions({
      onSuccess: () => {
        form.reset();
      },
    })
  );

  return (
    <Form {...form}>
      <form
        className="flex w-full items-center gap-2"
        onSubmit={form.handleSubmit((value) =>
          sendMessage({ content: value.content, uuid: channelUuid })
        )}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Send a message" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Send</Button>
      </form>
    </Form>
  );
}

export default MessageInput;
