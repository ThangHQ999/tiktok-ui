function NotFound() {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hiệu ứng nền */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: '#25F4EE',
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.15,
          top: '-150px',
          left: '-150px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          background: '#FE2C55',
          borderRadius: '50%',
          filter: 'blur(120px)',
          opacity: 0.15,
          bottom: '-120px',
          right: '-120px',
        }}
      />

      {/* Logo TikTok kiểu custom */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#25F4EE',
            borderRadius: '50%',
            transform: 'translate(4px, 4px)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FE2C55',
            borderRadius: '50%',
            transform: 'translate(-4px, -4px)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'relative',
            borderRadius: '50%',
            background: '#000',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 800,
            width: '100%',
            height: '100%',
          }}
        >
          Ⓣ
        </div>
      </div>

      <h1 style={{ fontSize: '60px', fontWeight: 'bold' }}>404</h1>
      <p style={{ fontSize: '18px', opacity: 0.8 }}>
        Oops! Trang bạn tìm không tồn tại.
      </p>

      <a
        href="/"
        style={{
          padding: '12px 28px',
          background: '#FE2C55',
          borderRadius: '999px',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '16px',
          transition: '0.3s',
        }}
        onMouseEnter={(e) => (e.target.style.background = '#d82247')}
        onMouseLeave={(e) => (e.target.style.background = '#FE2C55')}
      >
        Quay lại trang chủ
      </a>
    </div>
  );
}

export default NotFound;
