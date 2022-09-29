package org.lamisplus.modules.prep;

import com.foreach.across.config.AcrossApplication;
import com.foreach.across.core.AcrossModule;
import com.foreach.across.core.context.configurer.ComponentScanConfigurer;

@AcrossApplication(
		modules = {
				
		}
)
public class PrepModule extends AcrossModule {
	public static final String NAME = "PrepModule";
	public PrepModule() {
		super ();
		addApplicationContextConfigurer (new ComponentScanConfigurer(
				getClass ().getPackage ().getName () + ".repository",
				getClass ().getPackage ().getName () + ".service",
				getClass ().getPackage ().getName () + ".controller"
		));
	}
	@Override
	public String getName() {
		return NAME;
	}
}
