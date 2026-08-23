<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {

            $table->foreignId('user_id')
                ->after('id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->date('date')
                ->after('user_id');

            $table->time('time_in')
                ->nullable()
                ->after('date');

            $table->time('time_out')
                ->nullable()
                ->after('time_in');

            $table->enum('status', [
                'present',
                'late',
                'absent',
                'on_leave',
            ])
                ->default('present')
                ->after('time_out');

            $table->text('remarks')
                ->nullable()
                ->after('status');

            $table->unique(
                ['user_id', 'date'],
                'attendances_user_id_date_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {

            $table->dropUnique(
                'attendances_user_id_date_unique'
            );

            $table->dropForeign([
                'user_id'
            ]);

            $table->dropColumn([
                'user_id',
                'date',
                'time_in',
                'time_out',
                'status',
                'remarks',
            ]);
        });
    }
};