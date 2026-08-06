<?php

namespace App\Http\Controllers;

use App\Models\Inventaris;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventarisController extends Controller
{
    public function index()
    {
        $data = Inventaris::orderBy('nama_barang')->get();
        return Inertia::render('Inventaris/Index', ['inventaris' => $data]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'kode' => 'required|unique:inventaris,kode',
            'jumlah' => 'required|integer|min:1',
        ]);

        Inventaris::create($request->all());
        return back()->with('success', 'Barang ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $inventaris = Inventaris::findOrFail($id);
        $inventaris->update($request->all());
        return back()->with('success', 'Barang diupdate.');
    }

    public function destroy($id)
    {
        Inventaris::findOrFail($id)->delete();
        return back()->with('success', 'Barang dihapus.');
    }
}
