import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { teamMembers } from "@/data/teamMembers";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const TeamSection = () => {
  // Group team members by department
  const groupedByDept = teamMembers.reduce(
    (acc, member) => {
      const dept = member.department;
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(member);
      return acc;
    },
    {} as Record<string, typeof teamMembers>
  );

  return (
    <section className="py-20 md:py-32 overflow-hidden relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <Reveal>
            <span className="text-xs tracking-[0.15em] uppercase text-primary font-mono block mb-4">
              Our Team
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-6">
              Meet the People Behind Voxmation
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Our talented team is dedicated to delivering exceptional service and innovative solutions
              to help your business thrive.
            </p>
          </Reveal>
        </div>

        {/* Team Members */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {Object.entries(groupedByDept).map(([department, members]) => (
            <div key={department}>
              {/* Department Header */}
              <h3 className="text-xl font-semibold text-text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent" />
                {department}
              </h3>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {members.map((member, idx) => (
                  <motion.div
                    key={member.name}
                    variants={itemVariants}
                    className="group relative"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-1 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative bg-background rounded-xl overflow-hidden aspect-square">
                        {/* Image Container */}
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                          <p className="text-text-secondary text-sm line-clamp-3">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-text-primary mb-1">
                        {member.name}
                      </h4>
                      <p className="text-sm text-primary font-medium mb-1">
                        {member.role}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {member.department}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Reveal delay={0.3}>
            <p className="text-text-secondary mb-6">
              Interested in joining our team?
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <a
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-text-inverse font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              View Open Positions
              <span>→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
