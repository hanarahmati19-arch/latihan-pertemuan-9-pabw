import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import UserForm from './user-form';

type Props = {
    roles: { value: 'admin' | 'user'; label: string }[];
};

export default function CreateUser({ roles }: Props) {
    return (
        <>
            <Head title="Create user" />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Create user"
                    description="Add an account and choose its access role"
                />
                <UserForm roles={roles} />
            </div>
        </>
    );
}
