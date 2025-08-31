import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth';
import { type UserSignin, userSigninSchema } from '@/lib/schema/user';

export const Route = createFileRoute('/_auth/')({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm({
    resolver: zodResolver(userSigninSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();

  function onSignin(data: UserSignin) {
    authClient.signIn.email(data, {
      onError: ({ error }) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        navigate({ to: '/chat', reloadDocument: true });
      },
    });
  }

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            id="signin-form"
            onSubmit={form.handleSubmit(onSignin)}
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" form="signin-form" type="submit">
          Sign in
        </Button>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link className="text-primary hover:underline" to="/sign-up">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
