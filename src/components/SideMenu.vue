<template>
    <b-menu>
        <b-menu-list label="Menu">
            <b-menu-item label="Registrar Supervisor" tag="router-link" :to="{ path: '/signup' }"></b-menu-item>
            <b-menu-item label="Registrar Terapeuta invitado"></b-menu-item>
            <b-menu-item label="Registrar Usuario" tag="router-link" :to="{ name: 'regpat' }"></b-menu-item>
            <b-menu-item label="Usuarios" tag="router-link" :to="{ name: 'patients' }"></b-menu-item>
            <b-menu-item label="Consultar CURP" href="https://consultas.curp.gob.mx" target="_blank"></b-menu-item>
        </b-menu-list>
    </b-menu>
</template>