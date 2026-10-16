/**
 * The owner mandate: who owns the property, the host's role, and the three
 * legal declarations. Used by the agreement step and by verification (a
 * listing can't request a badge until this exists).
 */
import { View } from 'react-native';
import { Check, Choice, Field, KText } from '@/components/k';
import { color } from '@/lib/k/theme';
import { HostingPropertyRelationship, type HostingVerificationInput } from '@/lib/services/graphql/generated';

const ROLES: { value: HostingPropertyRelationship; title: string; detail: string }[] = [
	{ value: HostingPropertyRelationship.Landlord, title: 'I own it', detail: 'You are the legal owner with full rights to let or sell it.' },
	{ value: HostingPropertyRelationship.Agent, title: 'I’m the owner’s agent', detail: 'You have a written mandate or power of attorney from the owner.' },
	{ value: HostingPropertyRelationship.Subletter, title: 'I’m subletting', detail: 'You rent it, and your landlord has agreed in writing that you can sublet.' }
];

const DECLS: { key: 'declOwnership' | 'declLitigation' | 'declIndemnity'; text: string }[] = [
	{ key: 'declOwnership', text: 'I own this property, or I have written permission (a mandate, power of attorney or my landlord’s consent) to let it.' },
	{ key: 'declLitigation', text: 'There is no court case, dispute or foreclosure on this property that would stop a tenant living here in peace.' },
	{ key: 'declIndemnity', text: 'If what I’ve said about ownership or court cases is false, I take full legal and financial responsibility and will protect Kushi from any claims.' }
];

type V = Partial<HostingVerificationInput>;

export function mandateComplete(v: V) {
	return !!v.landlordFullName?.trim() && !!v.landlordAddress?.trim() && !!v.propertyRelationship && !!v.declOwnership && !!v.declLitigation && !!v.declIndemnity;
}

export function MandateFields({ v, update, tried }: { v: V; update: (p: V) => void; tried?: boolean }) {
	return (
		<View style={{ gap: 12 }}>
			<KText v="label">You are…</KText>
			{ROLES.map((r) => (
				<Choice key={r.value} title={r.title} detail={r.detail} on={v.propertyRelationship === r.value} onPress={() => update({ propertyRelationship: r.value })} />
			))}
			{tried && !v.propertyRelationship ? (
				<KText v="xs" c="danger">
					Choose one.
				</KText>
			) : null}
			<Field label="Owner’s full name" value={v.landlordFullName ?? ''} onChangeText={(landlordFullName) => update({ landlordFullName })} placeholder="As on the title document" autoCapitalize="words" error={tried && !v.landlordFullName?.trim() ? 'Enter the owner’s name.' : null} />
			<Field label="Owner’s address" value={v.landlordAddress ?? ''} onChangeText={(landlordAddress) => update({ landlordAddress })} placeholder="Where the owner can be served notices" error={tried && !v.landlordAddress?.trim() ? 'Enter the owner’s address.' : null} />
			<View style={{ gap: 14, marginTop: 4 }}>
				<KText v="label">Declarations</KText>
				{DECLS.map((d) => (
					<Check key={d.key} on={!!v[d.key]} onPress={() => update({ [d.key]: !v[d.key] })}>
						<KText v="small" style={tried && !v[d.key] ? { color: color.danger } : undefined}>
							{d.text}
						</KText>
					</Check>
				))}
			</View>
		</View>
	);
}
