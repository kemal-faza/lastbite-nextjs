'use client';

import {
	User,
	Settings,
	Clock,
	Heart,
	Award,
	ChevronRight,
	LogOut,
	Shield,
	HelpCircle,
	Store,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
	{ icon: Clock, label: 'Riwayat Pesanan', path: '/orders' },
	{ icon: Heart, label: 'Menu Favorit', path: '/wishlist' },
	{ icon: Store, label: 'Dashboard Mitra', path: '/seller' },
	{ icon: Shield, label: 'Keamanan Akun', path: '#' },
	{ icon: Settings, label: 'Pengaturan', path: '#' },
	{ icon: HelpCircle, label: 'Pusat Bantuan', path: '#' },
];

export default function ProfilePage() {
	const router = useRouter();

	return (
		<div className="flex flex-col bg-[var(--background)] pb-20 h-full">
			{/* Profile Header */}
			<div className="bg-white px-4 pt-8 pb-6 shadow-sm">
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
							<img
								src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
								alt="Profile"
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
							<Award className="w-3 h-3 text-white" />
						</div>
					</div>
					<div className="flex-1">
						<h1 className="text-xl font-bold text-gray-900">
							Nadia Putri
						</h1>
						<p className="text-sm text-gray-500 mb-2">
							nadia.putri@example.com
						</p>
						<div className="inline-flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
							<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
							<span className="text-xs font-medium text-green-700">
								Food Saver Level 3
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Impact Stats */}
			<div className="px-4 mt-4 mb-2">
				<h2 className="text-sm font-semibold text-gray-700 mb-3 px-1">
					Dampak Kamu Sejauh Ini
				</h2>
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
						<div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
							<span className="text-green-600 font-bold text-lg">
								Rp
							</span>
						</div>
						<span className="text-xl font-bold text-gray-900 leading-none mb-1">
							450K
						</span>
						<span className="text-xs text-gray-500">
							Uang Dihemat
						</span>
					</div>
					<div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
						<div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
							<span className="text-green-600 font-bold text-lg">
								&#9432;
							</span>
						</div>
						<span className="text-xl font-bold text-gray-900 leading-none mb-1">
							23
						</span>
						<span className="text-xs text-gray-500">
							Makanan Diselamatkan
						</span>
					</div>
				</div>
			</div>

			{/* Menu List */}
			<div className="px-4 mt-4">
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
					{MENU_ITEMS.map((item, index) => {
						const Icon = item.icon;
						return (
							<button
								key={index}
								onClick={() =>
									item.path !== '#' && router.push(item.path)
								}
								className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
								<Icon className="w-5 h-5 text-gray-500" />
								<span className="flex-1 text-sm font-medium text-gray-700 text-left">
									{item.label}
								</span>
								<ChevronRight className="w-4 h-4 text-gray-300" />
							</button>
						);
					})}
				</div>
			</div>

			{/* Logout */}
			<div className="px-4 mt-4">
				<button className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">
					<LogOut className="w-4 h-4" />
					Keluar
				</button>
			</div>
		</div>
	);
}
