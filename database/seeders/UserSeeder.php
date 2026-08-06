<?php

namespace Database\Seeders;

use App\Models\Santri;
use App\Models\User;
use App\Models\Ustadz;
use App\Models\Walisantri;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ========== ADMIN (1 orang) ==========
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        $admin->assignRole('admin');

        // ========== USTADZ ==========
        $ustadzData = [
            ['niu' => '201', 'nama_lengkap' => 'Syakur'],
            ['niu' => '202', 'nama_lengkap' => 'Riza'],
            ['niu' => '203', 'nama_lengkap' => 'Farhan'],
            ['niu' => '204', 'nama_lengkap' => 'Ali'],
            ['niu' => '205', 'nama_lengkap' => 'Sugeng'],
            ['niu' => '206', 'nama_lengkap' => 'Khanif'],
            ['niu' => '207', 'nama_lengkap' => 'Rahman'],
        ];

        foreach ($ustadzData as $u) {
            $user = User::create([
                'username' => $u['niu'],
                'password' => Hash::make('password'),
                'role' => 'ustadz',
            ]);
            $user->assignRole('ustadz');
            Ustadz::create([
                'user_id' => $user->id,
                'niu' => $u['niu'],
                'nama_lengkap' => $u['nama_lengkap'],
            ]);
        }

        // ========== WALISANTRI ==========
        $waliData = [
            ['niw' => '401', 'nama_lengkap' => 'Arifin', 'no_whatsapp' => '081201'],
            ['niw' => '402', 'nama_lengkap' => 'Mukhlis', 'no_whatsapp' => '081202'],
            ['niw' => '403', 'nama_lengkap' => 'Agus', 'no_whatsapp' => '081203'],
            ['niw' => '404', 'nama_lengkap' => 'Hasan', 'no_whatsapp' => '081204'],
            ['niw' => '405', 'nama_lengkap' => 'Muslim', 'no_whatsapp' => '081205'],
            ['niw' => '406', 'nama_lengkap' => 'Rudi', 'no_whatsapp' => '081206'],
        ];

        $waliMap = [];
        foreach ($waliData as $w) {
            $user = User::create([
                'username' => $w['niw'],
                'password' => Hash::make('password'),
                'role' => 'walisantri',
            ]);
            $user->assignRole('walisantri');
            $wali = Walisantri::create([
                'user_id' => $user->id,
                'niw' => $w['niw'],
                'nama_lengkap' => $w['nama_lengkap'],
                'no_whatsapp' => $w['no_whatsapp'],
            ]);
            $waliMap[$w['niw']] = $wali->id;
        }

        // ========== SANTRI ==========
        $santriData = [
            ['nis' => '301', 'nama_lengkap' => 'Farich', 'niw' => '401'],
            ['nis' => '302', 'nama_lengkap' => 'Labib', 'niw' => '402'],
            ['nis' => '303', 'nama_lengkap' => 'Ave', 'niw' => '403'],
            ['nis' => '304', 'nama_lengkap' => 'Faza', 'niw' => '404'],
            ['nis' => '305', 'nama_lengkap' => 'Daffa', 'niw' => '405'],
            ['nis' => '306', 'nama_lengkap' => 'Hamid', 'niw' => '406'],
            ['nis' => '307', 'nama_lengkap' => 'Fedrix', 'niw' => '401'],
            ['nis' => '308', 'nama_lengkap' => 'Taqwa', 'niw' => '402'],
            ['nis' => '309', 'nama_lengkap' => 'Sakin', 'niw' => '403'],
        ];

        foreach ($santriData as $s) {
            $user = User::create([
                'username' => $s['nis'],
                'password' => Hash::make('password'),
                'role' => 'santri',
            ]);
            $user->assignRole('santri');
            Santri::create([
                'user_id' => $user->id,
                'walisantri_id' => $waliMap[$s['niw']],
                'nis' => $s['nis'],
                'nama_lengkap' => $s['nama_lengkap'],
                'poin_kedisiplinan' => 100,
            ]);
        }
    }
}
