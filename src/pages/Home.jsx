import SideNavigation from "../components/SideNavigation";
const Home = () => {
  return (
    <div className="flex w-screen h-screen">
      <SideNavigation />
      <div className="bg-neutral-100 w-full h-screen flex p-8 pt-20 lg:pt-8 lg:ml-72 ">
        <h1>Bienvenido a la Intranet</h1>
        <p>Esta es la página principal de la intranet.</p>
        {/* Aquí puedes agregar más contenido según sea necesario */}
      </div>
    </div>
  );
};

export default Home;
