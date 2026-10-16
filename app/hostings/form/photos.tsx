import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Camera, CloudOff, Copy, FolderInput, MapPin, MoreHorizontal, PenLine, Plus, Star, Trash2 } from 'lucide-react-native';
import { Button, Card, Field, IconButton, KText, Notice, Row, Sheet, Spinner } from '@/components/k';
import { Block, PhotoTile, PickerSheet, StepScreen } from '@/components/k/listing-form';
import { VideoTourEditor } from '@/components/k/listing-video';
import { ListingPosters } from '@/components/k/listing-posters';
import { color, gutter, radius } from '@/lib/k/theme';
import { Pressable } from '@/components/k/pressable';
import { useLayout } from '@/lib/k/layout';
import { cleanError, useListingStep } from '@/lib/k/use-listing-step';
import { MIN_PHOTOS, photoCount, roomPhotoCount } from '@/lib/k/listing-steps';
import { useHostingFormRoomUtils } from '@/lib/hooks/forms/use-hosting-form-room-utils';
import { usePropertyTypeConfig } from '@/lib/hooks/use-property-type-config';
import { useUploadStore } from '@/lib/stores/uploads';
import { isLocationError, NEEDS_LOCATION } from '@/lib/k/photo-capture';
import { isLand } from '@/lib/constants/hosting/step-rules';
import { Room } from '@/lib/types/enums/hostings';
import type { RoomData } from '@/lib/stores/hostings';
import { toast } from '@/lib/hooks/use-toast';
import { useCopyHostingRoomMutation, useDeleteHostingRoomMutation, useHostingQuery } from '@/lib/services/graphql/generated';

/** iOS can't present a modal while another is still dismissing — wait for the sheet to close. */
const later = (fn: () => void) => setTimeout(fn, 380);
const label = (name: string) => (Room as Record<string, string>)[name] ?? name;

/** Step 2 — spaces with on-site photos, posters for land, and the optional video tour. */
export default function Photos() {
	const params = useLocalSearchParams<{ id?: string }>();
	const f = useListingStep(params.id, 'photos');
	const id = f.id ?? '';
	const r = useHostingFormRoomUtils(id);
	const hosting = f.hosting;
	const layout = useLayout();
	const { roomsFor } = usePropertyTypeConfig();
	const statuses = useUploadStore(useShallow((s) => Object.fromEntries(Object.values(s.tasks).map((t) => [t.uri, t.status]))));
	const retry = useUploadStore((s) => s.retry);
	const retryAll = useUploadStore((s) => s.retryAll);
	const removeTask = useUploadStore((s) => s.removeTask);

	const [addOpen, setAddOpen] = useState(false);
	const [menu, setMenu] = useState<number | null>(null);
	const [describe, setDescribe] = useState<{ index: number; text: string } | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
	const [select, setSelect] = useState<{ index: number; urls: string[] } | null>(null);
	const [moveOpen, setMoveOpen] = useState(false);
	const [copyRoom, setCopyRoom] = useState<{ id: string; name: string } | null>(null);
	const [, deleteRoom] = useDeleteHostingRoomMutation();
	const [deleting, setDeleting] = useState(false);

	const land = isLand(hosting?.propertyType);
	const cols = layout.compact ? 3 : layout.expanded ? 5 : 4;
	const inner = Math.min(layout.width - gutter * 2, layout.max('form') ?? Infinity) - 38;
	const tile = Math.floor((inner - 8 * (cols - 1)) / cols);

	// "Bedroom 2" labels for repeated spaces, in the order they were added.
	const labels = useMemo(() => {
		const seen: Record<string, number> = {};
		const totals: Record<string, number> = {};
		r.rooms.forEach((x) => (totals[x.name] = (totals[x.name] ?? 0) + 1));
		return r.rooms.map((x) => {
			seen[x.name] = (seen[x.name] ?? 0) + 1;
			return totals[x.name] > 1 ? `${label(x.name)} ${seen[x.name]}` : label(x.name);
		});
	}, [r.rooms]);

	const total = hosting ? photoCount(hosting) : 0;
	const pending = Object.values(statuses).filter((s) => s === 'queued' || s === 'uploading').length;
	const lost = Object.entries(statuses).filter(([, s]) => s === 'dead');
	const noLocation = useUploadStore((s) => Object.values(s.tasks).filter((t) => t.status === 'error' && isLocationError(t.lastError)).map((t) => t.uri).join('|'));
	const unlocated = noLocation ? noLocation.split('|') : [];
	// Location failures get their own notice — retrying can't fix them.
	const failed = Object.values(statuses).filter((s) => s === 'error').length - unlocated.length;
	const enough = total >= MIN_PHOTOS && (!land || hosting?.kind === 'CHILD' || (hosting ? roomPhotoCount(hosting) : 0) >= 1);
	const spaceOptions = roomsFor(hosting?.propertyType).map((v) => ({ value: v, label: label(v) }));
	const room = menu != null ? r.rooms[menu] : undefined;

	async function removeRoom(index: number) {
		const x = r.rooms[index];
		if (!x?.id) return setConfirmDelete(null);
		setDeleting(true);
		const res = await deleteRoom({ hostingRoomId: x.id });
		setDeleting(false);
		setConfirmDelete(null);
		if (res.error) return toast.show({ type: 'error', text2: cleanError(res.error.message) });
		toast.show({ type: 'success', text2: `${labels[index]} deleted.` });
		r.refetchHosting();
	}

	return (
		<StepScreen
			stepKey="photos"
			hosting={hosting}
			onBack={f.leave}
			loading={!f.ready}
			refreshing={false}
			onRefresh={r.refetchHosting}
			intro={land ? 'Take photos on the plot itself: the boundary, the frontage, the access road. Kushi’s camera stamps each one with the location, which is how renters know the land is real.' : 'Add each space, then take its photos on site with the Kushi camera. Each photo is stamped with the location, which is how renters know the place is real.'}
			primary={{ title: 'Continue', onPress: () => f.advance(id), testID: 'step-next' }}
			footnote={
				<KText v="xs" center style={{ color: enough ? color.success : color.fg2 }}>
					{enough ? `${total} photos added${pending ? ` · ${pending} still uploading` : ''}` : `${total} of ${MIN_PHOTOS} photos — you need ${MIN_PHOTOS} to publish${land ? ', including one taken on the land' : ''}`}
				</KText>
			}
		>
			{pending || failed ? (
				<Notice tone={failed ? 'danger' : 'info'} title={failed ? `${failed} photo${failed === 1 ? '' : 's'} didn’t upload` : `Uploading ${pending} photo${pending === 1 ? '' : 's'}`} action={failed ? 'Retry all' : undefined} onAction={retryAll}>
					{failed ? 'Tap a red photo to retry it, or retry them all. They’re saved on this phone until they go through.' : 'You can keep going — uploads carry on in the background and resume if you lose signal.'}
				</Notice>
			) : null}
			{unlocated.length ? (
				<Notice tone="danger" title={`${unlocated.length} photo${unlocated.length === 1 ? ' has' : 's have'} no location`} action="Remove them" onAction={() => unlocated.forEach((uri) => removeTask(uri))}>
					{NEEDS_LOCATION}. Retake {unlocated.length === 1 ? 'it' : 'them'} with the Kushi camera, with location on.
				</Notice>
			) : null}
			{lost.length ? (
				<Notice tone="warn" title={`${lost.length} photo${lost.length === 1 ? ' was' : 's were'} lost before uploading`} action="Clear them" onAction={() => lost.forEach(([uri]) => removeTask(uri))}>
					The copy on this phone is gone. Take them again.
				</Notice>
			) : null}

			<Block title={land ? 'Site photos' : 'Spaces'} sub={r.rooms.length ? 'Tap a photo to view or edit it. Use ⋯ for more.' : undefined}>
				{r.rooms.length === 0 ? (
					<Card>
						<View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
							<Camera size={26} color={color.muted} />
							<KText v="smallStrong" center>
								No spaces yet
							</KText>
							<KText v="xs" center>
								{land ? 'Add “Plot boundary” or “Front area” to start.' : 'Add the outside and each room — for example “Exterior”, “Living room”, “Bedroom”.'}
							</KText>
						</View>
					</Card>
				) : null}
				{r.rooms.map((x: RoomData, index) => {
					const selecting = select?.index === index;
					return (
						<Card key={x.id ?? `new-${index}`} style={{ padding: 14 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
								<View style={{ flex: 1 }}>
									<KText v="bodyStrong">{labels[index]}</KText>
									<KText v="xs">{x.images.length ? `${x.images.length} photo${x.images.length === 1 ? '' : 's'}` : 'No photos yet'}{x.description ? ' · described' : ''}</KText>
								</View>
								{!x.id ? <Spinner /> : null}
								<IconButton label={`More for ${labels[index]}`} size={38} onPress={() => setMenu(index)}>
									<MoreHorizontal size={18} color={color.fg} />
								</IconButton>
							</View>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
								{x.images.map((img, i) => (
									<PhotoTile
										key={img}
										uri={r.resolveThumb(img)}
										size={tile}
										status={statuses[img]}
										cover={!!r.coverImageUrl && img === r.coverImageUrl}
										selected={selecting && select.urls.includes(img)}
										label={`${labels[index]} photo ${i + 1}`}
										onRetry={() => retry(img)}
										onPress={() => (selecting ? setSelect({ index, urls: select.urls.includes(img) ? select.urls.filter((u) => u !== img) : [...select.urls, img] }) : r.handleOpenRoomImage(index, i))}
									/>
								))}
								{!selecting ? (
									<AddTile size={tile} disabled={!x.id} onPress={() => r.handleRoomImageEdit(index)} testID={index === 0 ? 'add-photos' : undefined} />
								) : null}
							</View>
							{selecting ? (
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
									<KText v="smallStrong" style={{ flex: 1 }}>
										{select.urls.length} selected
									</KText>
									{select.urls.length === 1 && !select.urls[0].startsWith('file') ? (
										<Button
											title="Cover"
											size="sm"
											variant="ghost"
											icon={<Star size={14} color={color.fg} />}
											onPress={() => {
												r.handleSetCoverImage(index, x.images.indexOf(select.urls[0]));
												setSelect(null);
											}}
										/>
									) : null}
									{r.rooms.filter((o) => o.id && o.id !== x.id).length ? <Button title="Move" size="sm" variant="ghost" icon={<FolderInput size={14} color={color.fg} />} disabled={!select.urls.length} onPress={() => setMoveOpen(true)} /> : null}
									<Button
										title="Delete"
										size="sm"
										variant="danger"
										disabled={!select.urls.length}
										onPress={() => {
											r.handleDeleteImages(index, select.urls);
											setSelect(null);
										}}
									/>
									<Button title="Done" size="sm" variant="quiet" onPress={() => setSelect(null)} />
								</View>
							) : null}
						</Card>
					);
				})}
				{r.rooms.length < 20 ? <Button title={r.rooms.length ? 'Add another space' : 'Add a space'} variant="ghost" block icon={<Plus size={16} color={color.fg} />} loading={r.hostingRoomSaving} onPress={() => setAddOpen(true)} testID="add-space" /> : null}
			</Block>

			<View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
				<MapPin size={15} color={color.muted} style={{ marginTop: 2 }} />
				<KText v="xs" style={{ flex: 1 }}>
					Turn on location for Kushi before you shoot. Photos without a location can’t be checked and may slow down verification.
				</KText>
			</View>

			{land && hosting ? <ListingPosters hostingId={id} posters={hosting.hostingImages ?? []} coverAssetId={hosting.coverImage?.asset?.id} size={tile} onChange={r.refetchHosting} /> : null}

			{hosting ? <VideoTourEditor hostingId={id} existing={hosting.video ? { url: hosting.video.asset.publicUrl, seconds: hosting.video.durationSeconds } : null} onSaved={r.refetchHosting} /> : null}

			<PickerSheet open={addOpen} onClose={() => setAddOpen(false)} title="Add a space" searchable={spaceOptions.length > 8} options={spaceOptions} empty="Choose the property type in step 1 first." onPick={(o) => r.handleSaveHostingRoom(r.rooms.length, { name: o.value as keyof typeof Room, images: [], count: 1 })} />

			<Sheet open={menu != null} onClose={() => setMenu(null)} title={menu != null ? labels[menu] : ''}>
				<Row icon={<Camera size={17} color={color.fg} />} title="Take photos" detail="Opens the Kushi camera" onPress={() => { const i = menu!; setMenu(null); later(() => r.handleRoomImageEdit(i)); }} />
				{room?.images.length ? <Row icon={<FolderInput size={17} color={color.fg} />} title="Select photos" detail="Set the cover, move or delete" onPress={() => { const i = menu!; setMenu(null); setSelect({ index: i, urls: [] }); }} /> : null}
				<Row icon={<PenLine size={17} color={color.fg} />} title={room?.description ? 'Edit description' : 'Describe this space'} detail="Optional — size, finishes, views" onPress={() => { const i = menu!; setMenu(null); later(() => setDescribe({ index: i, text: r.rooms[i]?.description ?? '' })); }} />
				{hosting?.kind === 'CHILD' && room?.id ? <Row icon={<Copy size={17} color={color.fg} />} title="Copy to another unit" detail="Same space and photos, no re-upload" onPress={() => { const c = { id: room.id!, name: labels[menu!] }; setMenu(null); later(() => setCopyRoom(c)); }} /> : null}
				<Row icon={<Trash2 size={17} color={color.danger} />} title="Delete this space" danger onPress={() => { const i = menu!; setMenu(null); later(() => setConfirmDelete(i)); }} />
			</Sheet>

			<Sheet open={!!describe} onClose={() => setDescribe(null)} title="Describe this space" footer={<Button title="Save" block loading={r.hostingRoomSaving} onPress={() => { if (!describe) return; const x = r.rooms[describe.index]; if (x) r.handleSaveHostingRoom(describe.index, { ...x, description: describe.text.trim() }); setDescribe(null); }} />}>
				<Field multiline value={describe?.text ?? ''} onChangeText={(text) => describe && setDescribe({ ...describe, text })} placeholder="e.g. Large en-suite room with a walk-in wardrobe and a view of the garden." maxLength={500} />
			</Sheet>

			<Sheet open={confirmDelete != null} onClose={() => setConfirmDelete(null)} title={confirmDelete != null ? `Delete ${labels[confirmDelete]}?` : ''}>
				<KText v="small">{confirmDelete != null && r.rooms[confirmDelete]?.images.length ? 'Its photos will be deleted too. This can’t be undone.' : 'This can’t be undone.'}</KText>
				<Button title="Delete" variant="danger" block loading={deleting} onPress={() => confirmDelete != null && removeRoom(confirmDelete)} />
				<Button title="Keep it" variant="ghost" block onPress={() => setConfirmDelete(null)} />
			</Sheet>

			<PickerSheet
				open={moveOpen}
				onClose={() => setMoveOpen(false)}
				title={`Move ${select?.urls.length ?? 0} photo${select?.urls.length === 1 ? '' : 's'} to…`}
				options={r.rooms.map((x, i) => ({ value: x.id ?? '', label: labels[i] })).filter((o) => o.value && o.value !== r.rooms[select?.index ?? -1]?.id)}
				onPick={(o) => {
					if (select) r.handleMoveImages(o.value, select.urls);
					setSelect(null);
				}}
			/>

			{copyRoom && hosting ? <CopySheet room={copyRoom} hostingId={id} parentId={hosting.parentId} onClose={() => setCopyRoom(null)} /> : null}
			{!hosting && f.ready ? (
				<Notice tone="danger" title="We couldn’t load this listing">
					<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
						<CloudOff size={15} color={color.muted} />
						<KText v="small">Pull down to try again.</KText>
					</View>
				</Notice>
			) : null}
		</StepScreen>
	);
}

function AddTile({ size, onPress, disabled, testID }: { size: number; onPress: () => void; disabled?: boolean; testID?: string }) {
	return (
		<Pressable accessibilityRole="button" accessibilityLabel="Take photos" onPress={onPress} disabled={disabled} testID={testID} style={({ pressed }) => [{ width: size, height: size, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: color.line2, alignItems: 'center', justifyContent: 'center', gap: 6 }, pressed && { opacity: 0.7 }, disabled && { opacity: 0.4 }]}>
			<Camera size={20} color={color.amber} />
			<KText v="micro">Add photos</KText>
		</Pressable>
	);
}

function CopySheet({ room, hostingId, parentId, onClose }: { room: { id: string; name: string }; hostingId: string; parentId?: string | null; onClose: () => void }) {
	const [{ data, fetching }] = useHostingQuery({ variables: { hostingId: parentId ?? '', childrenOnSale: false }, pause: !parentId });
	const [, copy] = useCopyHostingRoomMutation();
	const [busy, setBusy] = useState<string | null>(null);
	const targets = (data?.hosting?.children ?? []).filter((h) => h.id !== hostingId);
	return (
		<Sheet open onClose={onClose} title={`Copy ${room.name} to…`}>
			<KText v="xs">Pick another unit in the same property. The photos are shared, so nothing is uploaded again.</KText>
			{fetching ? <Spinner /> : null}
			{!fetching && !targets.length ? <KText v="small">There are no other units in this property yet.</KText> : null}
			{targets.map((t) => (
				<Row
					key={t.id}
					title={t.title || 'Untitled unit'}
					detail={busy === t.id ? 'Copying…' : undefined}
					onPress={async () => {
						if (busy) return;
						setBusy(t.id);
						const res = await copy({ hostingRoomId: room.id, targetHostingId: t.id });
						setBusy(null);
						if (res.error) return toast.show({ type: 'error', text2: cleanError(res.error.message) });
						toast.show({ type: 'success', text2: `${room.name} copied to ${t.title || 'the unit'}.` });
						onClose();
					}}
				/>
			))}
		</Sheet>
	);
}
