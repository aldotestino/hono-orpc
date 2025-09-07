import {
  type ChannelSettings as ChSettings,
  channelSettingsSchema,
} from "@hono-orpc/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Frown, Loader, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import ConfirmAction from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { orpc } from "@/lib/orpc-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const ChannelSettingsForm = ({
  channelUuid,
  channelSettings,
}: {
  channelUuid: string;
  channelSettings: ChSettings;
}) => {
  const form = useForm({
    resolver: zodResolver(channelSettingsSchema),
    defaultValues: channelSettings,
  });

  const aiEnabled = form.watch("ai.enabled");

  const queryClient = useQueryClient();

  const { mutateAsync: updateChannelSettings, isPending } = useMutation(
    orpc.chat.channel.setChannelSettings.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(orpc.chat.channel.getChannelSettings.queryKey({ input: { uuid: channelUuid } }), data);
        form.reset(data);
      },
    })
  );

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit((data) => updateChannelSettings({ uuid: channelUuid, settings: data }))}>
        <FormField
          control={form.control}
          name="ai.enabled"
          render={({ field }) => (
            <FormItem className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <FormLabel>AI Messages with @ai</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormDescription>
                When enabled, the AI will respond to messages that include the
                @ai keyword.
              </FormDescription>
            </FormItem>
          )}
        />
        {aiEnabled && (
          <>
            <FormField
              control={form.control}
              name="ai.model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openrouter/sonoma-dusk-alpha">Sonoma Dusk Alpha</SelectItem>
                        <SelectItem value="openrouter/sonoma-sky-alpha">Sonoma Sky Alpha</SelectItem>
                        <SelectItem value="openai/gpt-oss-20b:free">OpenAI GPT-OSS 20B</SelectItem>
                        <SelectItem value="openai/gpt-oss-120b:free">OpenAI GPT-OSS 120B</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    If the model or provider supports it, can use tools.
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ai.maxMessages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Messages</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The maximum number of messages to use for the AI response.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        )}
        <Button className="w-full" disabled={isPending || !form.formState.isDirty} type="submit">
          {isPending ? <Loader className="animate-spin" /> : <Save />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
};

function ChannelSettings({
  channelUuid,
  onDeleteChannel,
}: {
  onDeleteChannel: () => void;
  channelUuid: string;
}) {
  const { data: channelSettings, isPending } = useQuery(
    orpc.chat.channel.getChannelSettings.queryOptions({
      input: { uuid: channelUuid },
    })
  );

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Settings</h2>

      {isPending && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {channelSettings && (
        <ChannelSettingsForm
          channelSettings={channelSettings}
          channelUuid={channelUuid}
        />
      )}

      <ConfirmAction
        action={onDeleteChannel}
        description="Are you sure you want to delete this channel?"
        title="Delete Channel"
      >
        <Button className="w-full" variant="destructive">
          <Trash2 />
          Delete Channel
        </Button>
      </ConfirmAction>
    </div>
  );
}

export default ChannelSettings;
