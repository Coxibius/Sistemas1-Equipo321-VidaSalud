-- =====================================================================
-- Sistema de Gestión de Inventario - Farmacia VidaSalud
-- Actividad 7: Diseño de la Arquitectura de Datos y Normalización (3FN)
-- Motor sugerido: PostgreSQL
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabla: CATEGORIA
-- ---------------------------------------------------------------------
CREATE TABLE CATEGORIA (
    id_categoria    SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- Tabla: USUARIO
-- ---------------------------------------------------------------------
CREATE TABLE USUARIO (
    id_usuario      SERIAL PRIMARY KEY,
    nombre          VARCHAR(80) NOT NULL,
    rol             VARCHAR(20) NOT NULL
                    CHECK (rol IN ('Encargado','Auxiliar')),
    email           VARCHAR(100) UNIQUE,
    fecha_registro  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ---------------------------------------------------------------------
-- Tabla: PROVEEDOR
-- ---------------------------------------------------------------------
CREATE TABLE PROVEEDOR (
    id_proveedor    SERIAL PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20),
    email           VARCHAR(100)
);

-- ---------------------------------------------------------------------
-- Tabla: PRODUCTO
-- ---------------------------------------------------------------------
CREATE TABLE PRODUCTO (
    id_producto     SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    id_categoria    INT NOT NULL,
    precio          DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    fecha_creacion  DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES CATEGORIA(id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabla: LOTE  (resuelve 1:N Producto->Lote; separa cantidad y
--               fecha de vencimiento, que varían por lote, del producto)
-- ---------------------------------------------------------------------
CREATE TABLE LOTE (
    id_lote             SERIAL PRIMARY KEY,
    id_producto         INT NOT NULL,
    cantidad            INT NOT NULL CHECK (cantidad >= 0),
    fecha_ingreso        DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento    DATE NOT NULL,
    estado_vencimiento   VARCHAR(20) NOT NULL DEFAULT 'Vigente'
                        CHECK (estado_vencimiento IN
                              ('Vigente','Proximo_a_Vencer','Vencido')),
    CONSTRAINT fk_lote_producto
        FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tabla intermedia: PRODUCTO_PROVEEDOR (resuelve la asociación M:N
--                    entre PRODUCTO y PROVEEDOR)
-- ---------------------------------------------------------------------
CREATE TABLE PRODUCTO_PROVEEDOR (
    id_producto         INT NOT NULL,
    id_proveedor        INT NOT NULL,
    precio_compra       DECIMAL(10,2) NOT NULL CHECK (precio_compra > 0),
    fecha_ultima_compra DATE,
    PRIMARY KEY (id_producto, id_proveedor),
    CONSTRAINT fk_pp_producto
        FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pp_proveedor
        FOREIGN KEY (id_proveedor) REFERENCES PROVEEDOR(id_proveedor)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tabla: MOVIMIENTO_INVENTARIO
-- Estrategia de herencia: Single Table (discriminador tipo_movimiento)
-- ya que ENTRADA y SALIDA comparten exactamente los mismos atributos.
-- ---------------------------------------------------------------------
CREATE TABLE MOVIMIENTO_INVENTARIO (
    id_movimiento       SERIAL PRIMARY KEY,
    id_lote             INT NOT NULL,
    id_usuario          INT NOT NULL,
    tipo_movimiento      VARCHAR(10) NOT NULL
                        CHECK (tipo_movimiento IN ('Entrada','Salida')),
    cantidad            INT NOT NULL CHECK (cantidad > 0),
    fecha               DATE NOT NULL DEFAULT CURRENT_DATE,
    estado_movimiento    VARCHAR(15) NOT NULL DEFAULT 'Pendiente'
                        CHECK (estado_movimiento IN
                              ('Pendiente','Validado','Rechazado','Registrado')),
    CONSTRAINT fk_mov_lote
        FOREIGN KEY (id_lote) REFERENCES LOTE(id_lote)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_mov_usuario
        FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabla: ALERTA
-- ---------------------------------------------------------------------
CREATE TABLE ALERTA (
    id_alerta           SERIAL PRIMARY KEY,
    id_lote             INT NOT NULL,
    tipo_alerta          VARCHAR(25) NOT NULL
                        CHECK (tipo_alerta IN
                              ('Proximo_Vencimiento','Vencimiento')),
    mensaje             VARCHAR(200) NOT NULL,
    fecha_generacion     DATE NOT NULL DEFAULT CURRENT_DATE,
    atendida            BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_alerta_lote
        FOREIGN KEY (id_lote) REFERENCES LOTE(id_lote)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Índices de apoyo a búsquedas frecuentes (HU02, HU04)
-- ---------------------------------------------------------------------
CREATE INDEX idx_producto_nombre ON PRODUCTO(nombre);
CREATE INDEX idx_lote_producto ON LOTE(id_producto);
CREATE INDEX idx_lote_fecha_venc ON LOTE(fecha_vencimiento);
CREATE INDEX idx_mov_lote ON MOVIMIENTO_INVENTARIO(id_lote);