import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Clock } from 'lucide-react';

interface QueueIndicatorProps {
	initialQueue?: number;
	storeName?: string;
}

export function QueueIndicator({
	initialQueue = 3,
	storeName,
}: QueueIndicatorProps) {
	const [currentQueue, setCurrentQueue] = useState(initialQueue);

	useEffect(() => {
		const interval = setInterval(
			() => {
				setCurrentQueue((prev) => {
					// simulate queue decreasing, sometimes increasing
					const delta = Math.random() < 0.6 ? -1 : 1;
					const next = prev + delta;
					return Math.max(2, Math.min(8, next));
				});
			},
			8000 + Math.random() * 7000,
		); // 8-15s random interval

		return () => clearInterval(interval);
	}, []);

	const estimatedTime = currentQueue * 2; // 2 min per person

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-[var(--secondary)]/10 rounded-full flex items-center justify-center relative">
						<Users className="w-5 h-5 text-[var(--secondary)]" />
						<AnimatePresence mode="popLayout">
							<motion.span
								key={currentQueue}
								initial={{ scale: 0.5, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.5, opacity: 0 }}
								className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--destructive)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
								{currentQueue}
							</motion.span>
						</AnimatePresence>
					</div>
					<div>
						<h3 className="font-semibold text-gray-900 text-sm">
							Ongoing Payment
						</h3>
						<p className="text-xs text-gray-500">
							{storeName ? storeName : 'Antrean pickup'} —{' '}
							{currentQueue} orang
						</p>
					</div>
				</div>
				<div className="text-right">
					<div className="flex items-center gap-1 text-[var(--destructive)]">
						<Clock className="w-3.5 h-3.5" />
						<span className="text-sm font-bold">
							{estimatedTime} menit
						</span>
					</div>
					<p className="text-[10px] text-gray-400">estimasi tunggu</p>
				</div>
			</div>

			{/* Mini progress bar visual */}
			<div className="mt-3 flex gap-1">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className={
							'h-1.5 flex-1 rounded-full transition-colors duration-500 ' +
							(i < currentQueue
								? 'bg-[var(--secondary)]'
								: 'bg-gray-100')
						}
					/>
				))}
			</div>
		</div>
	);
}
