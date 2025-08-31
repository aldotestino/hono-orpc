import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { useState } from 'react';
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
import { type UserSignup, userSignupSchema } from '@/lib/schema/user';

export const Route = createFileRoute('/sign-up')({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.isAuthenticated) {
      throw redirect({ to: '/chat' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(userSignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSignup(data: UserSignup) {
    setIsLoading(true);
    const { error } = await authClient.signUp.email(data);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    location.href = '/chat';
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSignup)}>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading && <Loader className="animate-spin" />}
                Sign up
              </Button>
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link className="text-primary hover:underline" to="/">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
