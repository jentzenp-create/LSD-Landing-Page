
import React from 'react';

const ValueProps: React.FC = () => {
  const props = [
    {
      id: 1,
      tag: "Removes Awkwardness",
      title: "No More Uncomfortable Review Requests",
      description: "Patients receive a polite follow-up text after you've left—when they're relaxed and more likely to respond positively.",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      tag: "Saves Time",
      title: "One Tap. Fully Automated.",
      description: "Just mark the visit as completed. The system handles reminder texts automatically over the next few days—no manual follow-ups needed.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      tag: "More Growth",
      title: "More 5-Star Reviews = More Booked Appointments",
      description: "Consistent Google reviews help your lab show up higher in local search and build instant trust with new patients.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section id="features" className="py-24 bg-offWhite">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((prop) => (
            <div 
              key={prop.id} 
              className="bg-white border border-black/5 p-8 rounded-holo flex flex-col h-full hover:shadow-xl transition-all group"
            >
              <div className="mb-6 overflow-hidden rounded-2xl aspect-[16/10]">
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
                {prop.tag}
              </span>
              <h3 className="text-2xl font-bold mb-4 leading-tight text-black">
                {prop.title}
              </h3>
              <p className="text-charcoal/60 leading-relaxed font-medium">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
